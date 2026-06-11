import express from 'express';
import {
  getCandidateConversations,
  createConversation,
  getCandidateApplications,
  getConversationDetails,
  getCandidateUnreadCount,
} from '../../controllers/candidateConversation.controller.js';

import {
  getConversationMessages,
  sendMessageController,
} from '../../controllers/message.controller.js';

const router = express.Router();

// conversation
router.get('/conversations/unread-count', getCandidateUnreadCount);
router.get('/conversations/candidate', getCandidateConversations);
router.get('/conversations/:id', getConversationDetails);
router.post('/conversations', createConversation);

// message
router.get('/messages', getConversationMessages);
router.post('/messages', sendMessageController);

router.get('/applications', getCandidateApplications);
export default router;
