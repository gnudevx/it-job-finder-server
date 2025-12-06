import express from 'express';
import {
  getAllJobs,
  getJobDetail,
  updateJobStatus,
} from '../../controllers/adminJob.controller.js';

const router = express.Router();

// GET /admin/jobs => lấy tất cả job
router.get('/manage/recruiment', getAllJobs);

// GET /admin/jobs/:jobId => xem chi tiết job
router.get('/manage/jobs/:jobId', getJobDetail);

// PATCH /admin/jobs/:jobId/status => update trạng thái
router.patch('/manage/jobs/:jobId/status', updateJobStatus);

export default router;
