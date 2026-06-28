// server.js
import http from 'http';
import app from './app.js';
import { Server as SocketIO } from 'socket.io';
import Conversation from './models/conversation.model.js';
import Employer from './models/employer.model.js';
import Candidate from './models/candidate.model.js';
const PORT = process.env.PORT || 5000;

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
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'https://it-job-finder-client-five.vercel.app',
      ];

      // Cho phép tất cả preview URL của Vercel project
      const isVercelPreview =
        /^https:\/\/it-job-finder-client-.*\.vercel\.app$/.test(origin);

      if (!origin || allowed.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  socket.on('join', ({ userId, role }) => {
    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);
  });
});

// Server listen
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
