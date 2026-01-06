import express from 'express';
import {
  NotificationController,
  getEmployerNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

// Admin create & admin list (protected)
router.post('/employer', NotificationController.create);
router.get('/employer', NotificationController.adminList);
router.get('/employer/system-notification', getEmployerNotifications);
export default router;
