import express from 'express';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';
import uploadResumeMiddleware from '../../middlewares/uploadResume.js';
import {
  uploadResume,
  getResumes,
  deleteResume,
  setDefaultResume,
  downloadResume,
  recommendResume,
  viewResume,
} from '../../controllers/resume.controller.js';

const router = express.Router();

// Upload CV
router.post(
  '/upload',
  verifyAccessToken,
  uploadResumeMiddleware.single('file'),
  uploadResume,
);

// Lấy danh sách CV
router.get('/', verifyAccessToken, getResumes);

// Xem CV inline preview
router.get('/:id/view', viewResume);

// Download CV
router.get('/:id/download', verifyAccessToken, downloadResume);

// Recommend jobs từ CV
router.post('/:id/recommend', verifyAccessToken, recommendResume);

// Xóa CV
router.delete('/:id', verifyAccessToken, deleteResume);

// Đặt CV mặc định
router.put('/default/:id', verifyAccessToken, setDefaultResume);

export default router;
