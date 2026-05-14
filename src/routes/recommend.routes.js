import express from 'express';
import {
  getRecommendedJobs,
  getRecommendedCvs,
} from '../controllers/recommend.controller.js';

const router = express.Router();

// jobs
router.get('/jobs/:jobId', getRecommendedJobs);
router.get('/jobs/:jobId/cvs', getRecommendedCvs);

export default router;
