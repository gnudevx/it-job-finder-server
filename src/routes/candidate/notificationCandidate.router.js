// routes/candidateNotification.route.js
import express from 'express';
import {
  NotificationController,
  getCandidateNotifications,
} from '../../controllers/notification.controller.js';

const router = express.Router();

router.get('/', NotificationController.candidateList);
router.get('/notifications', getCandidateNotifications);
router.get('/:id', NotificationController.getById);
router.post('/:id/read', NotificationController.markRead);

export default router;
