import express from 'express';
import { getRecommendedJobs } from '../controllers/recommend.controller.js';

const router = express.Router();

// jobs
router.get('/jobs/:jobId', getRecommendedJobs);

export default router;
