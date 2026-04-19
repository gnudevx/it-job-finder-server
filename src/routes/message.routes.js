import express from 'express';
import { markAsRead } from '../controllers/message.controller.js';
const router = express.Router();

// 🔥 đánh dấu đã đọc
router.post('/mark-as-read', markAsRead);

export default router;
