import express from 'express';
import { markAsRead } from '../controllers/message.controller.js';
import Message from '../models/message.model.js';
import uploadChatFile from '../middlewares/uploadChatFile.middleware.js';
const router = express.Router();

// đánh dấu đã đọc
router.post('/mark-as-read', markAsRead);

// lấy trạng thái online/hoạt động cuối cùng
router.get('/user-status/:userId', (req, res) => {
  const { userId } = req.params;
  const onlineUsers = req.app.get('onlineUsers');
  const lastActiveMap = req.app.get('lastActiveMap');

  const isOnline = onlineUsers ? onlineUsers.has(String(userId)) : false;
  const lastActive = lastActiveMap ? lastActiveMap.get(String(userId)) : null;

  res.json({
    userId,
    isOnline,
    lastActive,
  });
});

router.post('/send-file', uploadChatFile.single('file'), async (req, res) => {
  try {
    const { conversationId, senderId } = req.body;
    const file = req.file;

    const message = await Message.create({
      conversationId,
      senderId,
      type: 'file',
      file: {
        url: `/uploads/chat/${file.filename}`,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    });

    // emit realtime

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
