import express from 'express';
import {
  getRecommendedJobs,
  getRecommendedCvs,
} from '../controllers/recommend.controller.js';
import { requireEmployerTier } from '../middlewares/requireEmployerTier.js';

const router = express.Router();

// jobs
router.get('/jobs/:jobId', getRecommendedJobs);
// CV recommendations require authentication (employer access)
router.get(
  '/jobs/:jobId/cvs',
  requireEmployerTier({
    allowedTiers: ['PRO', 'ENTERPRISE'],
    message:
      'Gói Khởi Đầu chưa dùng được gợi ý CV (Module). Hãy nâng lên gói Tăng Tốc hoặc Toàn Diện.',
  }),
  getRecommendedCvs,
);

export default router;
