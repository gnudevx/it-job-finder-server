import express from 'express';
import {
  getCandidateConversations,
  createConversation,
  getCandidateApplications,
} from '../../controllers/candidateConversation.controller.js';

import {
  getConversationMessages,
  sendMessageController,
} from '../../controllers/message.controller.js';

const router = express.Router();

// conversation
router.get('/conversations/candidate', getCandidateConversations);
router.post('/conversations', createConversation);

// message
router.get('/messages/:conversationId', getConversationMessages);
router.post('/messages', sendMessageController);

router.get('/applications', getCandidateApplications);

export default router;
