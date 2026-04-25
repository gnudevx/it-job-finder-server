// server.js
import http from 'http';
import app from './app.js';
import { Server as SocketIO } from 'socket.io';
import Conversation from './models/conversation.model.js';
import Employer from './models/employer.model.js';
import Candidate from './models/candidate.model.js';
const PORT = process.env.PORT || 5000;

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

  // 🧠 join room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });
  // 💬 gửi tin nhắn
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
    // 👉 update DB
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: message.text,
        lastMessageTime: message.createdAt,
        $inc: {
          'unreadCount.employer': isEmployerSender ? 0 : 1,
          'unreadCount.candidate': isCandidateSender ? 0 : 1,
        },
      },
      { new: true },
    );

    // 🔥 gửi luôn unreadCount về client
    io.to(conversationId).emit('receive-message', {
      ...message,
      unreadCount: updated.unreadCount,
    });
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
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
