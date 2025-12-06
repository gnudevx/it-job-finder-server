import express from 'express';
import {
  adminEmployerController,
  updateEmployerStatus,
  adminChangeEmployerPasswordController,
} from '../../controllers/adminEmployer.controller.js';

const router = express.Router();

router.get('/employers', adminEmployerController.getAll);
router.get('/employers/:id', adminEmployerController.getById);
router.patch('/employers/:id/status', updateEmployerStatus);
router.patch(
  '/employers/:id/change-password',
  adminChangeEmployerPasswordController,
);
export default router;
