// server.js
import http from 'http';
import app from './app.js';
import { Server as SocketIO } from 'socket.io';
import Conversation from './models/conversation.model.js';
import Employer from './models/employer.model.js';
import Candidate from './models/candidate.model.js';
import Message from './models/message.model.js';
const PORT = process.env.PORT || 5000;
// Map lưu session đang gọi trong memory
const callSessions = new Map();
// Map lưu timeout cho missed call (30s không nghe = missed)
const callTimeouts = new Map();

// Trạng thái hoạt động online/offline
const onlineUsers = new Map();
const lastActiveMap = new Map();
app.set('onlineUsers', onlineUsers);
app.set('lastActiveMap', lastActiveMap);

// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo socket.io
export const io = new SocketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

app.set('io', io);
// Socket events
io.on('connection', (socket) => {
  console.log('Socket connected: ', socket.id);

  // join room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });
  // gửi tin nhắn
  socket.on('send-message', async ({ conversationId, message }) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    const employer = await Employer.findById(conversation.employerId);
    const candidate = await Candidate.findById(conversation.candidateId);
    const senderId = String(message.senderId);

    const isEmployerSender = String(employer.userId) === senderId;

    const isCandidateSender = String(candidate.userId) === senderId;
    if (!isEmployerSender && !isCandidateSender) {
      console.log('❌ Sender không thuộc conversation');
      return;
    }
    // update DB
    let lastMessageText = message.text || '';
    if (message.type === 'file') {
      lastMessageText = '📎 File';
    } else if (message.type === 'interview') {
      lastMessageText = '📅 Lịch phỏng vấn';
    } else if (message.type === 'assignment') {
      lastMessageText = '📝 Test Assignment';
    } else if (message.type === 'assignment_submit') {
      lastMessageText = '✅ Nộp bài Assignment';
    }

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: lastMessageText,
        lastMessageTime: message.createdAt,
        $inc: {
          'unreadCount.employer': isEmployerSender ? 0 : 1,
          'unreadCount.candidate': isCandidateSender ? 0 : 1,
        },
      },
      { new: true },
    );

    // gửi luôn unreadCount về client
    io.to(conversationId).emit('receive-message', {
      ...message,
      unreadCount: updated.unreadCount,
    });

    // Gửi đến room cá nhân của người nhận để cập nhật unread badge ngoài khung chat
    const receiverUserId = isEmployerSender
      ? String(candidate.userId)
      : String(employer.userId);
    if (receiverUserId) {
      io.to(`user:${receiverUserId}`).emit('receive-message', {
        ...message,
        unreadCount: updated.unreadCount,
      });
    }
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    let disconnectedUserId = null;
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = uid;
        break;
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      const now = new Date();
      lastActiveMap.set(disconnectedUserId, now);
      io.emit('user:status', {
        userId: disconnectedUserId,
        status: 'offline',
        lastActive: now,
      });
    }
  });
  socket.on('user:join', (userId) => {
    socket.join(`user:${userId}`);
    onlineUsers.set(String(userId), socket.id);
    lastActiveMap.set(String(userId), new Date());
    console.log(`User ${userId} joined personal room`);

    // Phát trạng thái online
    io.emit('user:status', {
      userId,
      status: 'online',
    });
  });
  socket.on('call:ring', async ({ conversationId, callerId }) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    const employer = await Employer.findById(conversation.employerId);
    const candidate = await Candidate.findById(conversation.candidateId);

    // khai báo trước, dùng sau
    const isEmployerCaller = String(employer.userId) === String(callerId);

    const calleeUserId = isEmployerCaller
      ? String(candidate.userId)
      : String(employer.userId);

    const callerInfo = isEmployerCaller
      ? { name: employer.fullName, avatar: employer.avatar }
      : { name: candidate.fullName, avatar: candidate.avatar };

    callSessions.set(conversationId, {
      callerId,
      status: 'ringing',
      ringTime: new Date(),
    });

    io.to(`user:${calleeUserId}`).emit('call:ring', {
      conversationId,
      callerId,
      callerName: callerInfo.name,
      callerAvatar: callerInfo.avatar,
    });

    // Timeout missed 30s
    const timeout = setTimeout(async () => {
      const session = callSessions.get(conversationId);
      if (session?.status === 'ringing') {
        callSessions.delete(conversationId);
        callTimeouts.delete(conversationId);

        const msg = await Message.create({
          conversationId,
          type: 'call',
          callStatus: 'missed',
          callInitiatorId: callerId,
          callDuration: 0,
          callStartTime: session.ringTime,
          callEndTime: new Date(),
        });

        io.to(conversationId).emit('call:missed', {
          conversationId,
          message: msg,
        });
      }
    }, 30000);

    callTimeouts.set(conversationId, timeout);
  });

  // Bước 2: Signaling WebRTC (giữ nguyên)
  socket.on('call:offer', ({ conversationId, sdp }) => {
    socket.to(conversationId).emit('call:offer', { sdp });
  });
  socket.on('call:accepted', ({ conversationId }) => {
    const session = callSessions.get(conversationId);
    if (!session) return;

    if (!session.startTime) {
      session.status = 'ongoing';
      session.startTime = new Date();
    }

    clearTimeout(callTimeouts.get(conversationId));
    callTimeouts.delete(conversationId);

    // THÊM: báo cho caller biết callee đã sẵn sàng
    socket.to(conversationId).emit('call:accepted', { conversationId });
  });
  socket.on('call:answer', ({ conversationId, sdp }) => {
    // Xoá timeout missed vì đã nghe máy
    clearTimeout(callTimeouts.get(conversationId));
    callTimeouts.delete(conversationId);
    const session = callSessions.get(conversationId);
    // Cập nhật session → đang gọi
    if (session) {
      session.status = 'ongoing';
      session.startTime = new Date();
    }

    socket.to(conversationId).emit('call:answer', { sdp });
  });

  socket.on('call:ice-candidate', ({ conversationId, candidate }) => {
    socket.to(conversationId).emit('call:ice-candidate', { candidate });
  });

  // Bước 3a: Callee chủ động từ chối
  socket.on('call:decline', async ({ conversationId }) => {
    clearTimeout(callTimeouts.get(conversationId));
    callTimeouts.delete(conversationId);

    const session = callSessions.get(conversationId);
    callSessions.delete(conversationId);

    const msg = await Message.create({
      conversationId,
      type: 'call',
      callStatus: 'declined',
      callInitiatorId: session?.callerId,
      callDuration: 0,
      callStartTime: session?.ringTime,
      callEndTime: new Date(),
    });

    // Báo caller biết bị từ chối
    io.to(conversationId).emit('call:declined', {
      conversationId,
      message: msg,
    });
  });

  // Bước 3b: Kết thúc cuộc gọi đang diễn ra
  socket.on('call:end', async ({ conversationId }) => {
    const session = callSessions.get(conversationId);

    // nếu đã xử lý rồi thì bỏ
    if (!session || session.ended) return;

    session.ended = true; // đánh dấu

    clearTimeout(callTimeouts.get(conversationId));
    callTimeouts.delete(conversationId);

    const endTime = new Date();
    const duration = session.startTime
      ? Math.floor((endTime - session.startTime) / 1000)
      : 0;

    const msg = await Message.create({
      conversationId,
      type: 'call',
      callStatus: session.startTime ? 'completed' : 'missed',
      callInitiatorId: session.callerId,
      callDuration: duration,
      callStartTime: session.startTime || session.ringTime,
      callEndTime: endTime,
    });

    callSessions.delete(conversationId);

    io.to(conversationId).emit('call:ended', {
      conversationId,
      message: msg,
    });
  });

  socket.on('join', ({ userId, role }) => {
    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);
  });
});

// Server listen
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
