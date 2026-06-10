/**
 * aiRecommend.routes.js
 * Thêm vào app.js: import aiRecommendRoutes from './routes/aiRecommend.routes.js'
 *                  app.use('/api/ai', aiRecommendRoutes)
 */

import express from 'express';
import { getRecommendations } from '../controllers/aiRecommendController.js';

const router = express.Router();

// POST /api/ai/recommend
router.post('/recommend', getRecommendations);

export default router;
