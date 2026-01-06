import express from 'express';
import {
  getMyInfo,
  updateCandidate,
} from '../../controllers/candidate.controller.js';

const router = express.Router();

// Lấy thông tin từ token
router.get('/profile', getMyInfo);

// Cập nhật thông tin
router.put('/profile', updateCandidate);

export default router;
