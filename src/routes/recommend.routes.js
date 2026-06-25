import express from 'express';
import {
  getRecommendedJobs,
  getRecommendedCvs,
} from '../controllers/recommend.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// jobs
router.get('/jobs/:jobId', getRecommendedJobs);
// CV recommendations require authentication (employer access)
router.get('/jobs/:jobId/cvs', verifyAccessToken, getRecommendedCvs);

export default router;
