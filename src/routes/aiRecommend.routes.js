/**
 * aiRecommend.routes.js
 * Thêm vào app.js: import aiRecommendRoutes from './routes/aiRecommend.routes.js'
 *                  app.use('/api/ai', aiRecommendRoutes)
 */

import express from 'express';
import { getRecommendations } from '../controllers/aiRecommendController.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import { requireEmployerTier } from '../middlewares/requireEmployerTier.js';

const router = express.Router();

// POST /api/ai/recommend
router.post(
  '/recommend',
  verifyAccessToken,
  requireEmployerTier({
    allowedTiers: ['ENTERPRISE'],
    message:
      'Chỉ gói Toàn Diện mới dùng được gợi ý CV (AI). Vui lòng nâng cấp gói.',
  }),
  getRecommendations,
);

export default router;
