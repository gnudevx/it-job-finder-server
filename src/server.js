// server.js
import http from 'http';
import app from './app.js';
import { Server as SocketIO } from 'socket.io';

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

// Socket events
io.on('connection', (socket) => {
  console.log('Socket connected: ', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Server listen
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
