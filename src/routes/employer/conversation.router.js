import express from 'express';
import {
  getEmployerConversations,
  createConversation,
  getCandidate,
} from '../../controllers/conversation.controller.js';

import {
  getConversationMessages,
  sendMessageController,
} from '../../controllers/message.controller.js';

const router = express.Router();

// conversation
router.get('/conversations/employer', getEmployerConversations);
router.post('/conversations', createConversation);

// message
router.get('/messages', getConversationMessages);
router.post('/messages', sendMessageController);

router.get('/applications', getCandidate);

export default router;
