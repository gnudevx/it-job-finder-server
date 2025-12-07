import express from 'express';
import {
  getMyInfo,
  updateCandidate,
} from '../../controllers/candidate.controller.js';
import { verifyToken } from '../../middlewares/jwt.js';

const router = express.Router();

// Lấy thông tin từ token
router.get('/profile', verifyToken, getMyInfo);

// Cập nhật thông tin
router.put('/profile', verifyToken, updateCandidate);

export default router;
