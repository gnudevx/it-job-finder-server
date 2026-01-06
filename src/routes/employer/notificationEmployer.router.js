// routes/employerNotification.route.js
import express from 'express';
import {
  NotificationController,
  getEmployerNotifications,
} from '../../controllers/notification.controller.js';

const router = express.Router();

router.get('/', NotificationController.userList);
router.get('/notifications', getEmployerNotifications);
router.get('/:id', NotificationController.getById);
router.post('/:id/read', NotificationController.markRead);

export default router;
