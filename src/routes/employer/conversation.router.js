import express from 'express';
import {
  getEmployerConversations,
  createConversation,
  getCandidate,
  getConversationDetails,
  getEmployerUnreadCount,
} from '../../controllers/conversation.controller.js';

import {
  getConversationMessages,
  sendMessageController,
} from '../../controllers/message.controller.js';

const router = express.Router();

// conversation
router.get('/conversations/unread-count', getEmployerUnreadCount);
router.get('/conversations/employer', getEmployerConversations);
router.get('/conversations/:id', getConversationDetails);
router.post('/conversations', createConversation);

// message
router.get('/messages', getConversationMessages);
router.post('/messages', sendMessageController);

router.get('/applications', getCandidate);

export default router;
