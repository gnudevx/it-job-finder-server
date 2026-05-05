import express from 'express';
import { markAsRead } from '../controllers/message.controller.js';
import Message from '../models/message.model.js';
import uploadChatFile from '../middlewares/uploadChatFile.middleware.js';
const router = express.Router();

// 🔥 đánh dấu đã đọc
router.post('/mark-as-read', markAsRead);

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
