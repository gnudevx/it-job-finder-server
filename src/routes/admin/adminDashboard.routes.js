import express from 'express';
import {
  getDashboardSummary,
  getJobStats,
  getUserGrowth,
  getEmployerStats,
} from '../../controllers/adminDashboard.controller.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/jobs-stats', getJobStats);
router.get('/users-growth', getUserGrowth);
router.get('/employers-stats', getEmployerStats);

export default router;
