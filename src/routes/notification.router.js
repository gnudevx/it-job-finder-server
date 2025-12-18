import express from 'express';
import {
  NotificationController,
  getEmployerNotifications,
  getCandidateNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

// Admin create & admin list (protected)
router.post('/', NotificationController.create);
router.get('/', NotificationController.adminList);
router.get('/candidate/system-notification', getCandidateNotifications);
router.get('/employer/system-notification', getEmployerNotifications);
export default router;
