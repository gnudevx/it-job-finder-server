import express from 'express';
import {
  applyJobController,
  getMyAppliedJobsController,
} from '../../controllers/applyJobs.controller.js';

const router = express.Router();

router.post('/apply', applyJobController);
router.get('/my', getMyAppliedJobsController);

export default router;
