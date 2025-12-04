// routes/employer/applications.router.js
import express from 'express';
import {
  getAppliedByEmployer,
  updateApplicationStatus,
} from '../../controllers/application.controller.js';

const router = express.Router();

// GET: Lấy danh sách ứng tuyển theo job thuộc employer
router.get('/', getAppliedByEmployer);
router.patch('/:id/status', updateApplicationStatus);

export default router;
