import {
  getMessages,
  sendMessage,
  markConversationAsRead,
} from '../services/message.service.js';
import Conversation from '../models/conversation.model.js';
import Employer from '../models/employer.model.js';
import Candidate from '../models/candidate.model.js';

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId, cursor } = req.query;

    const messages = await getMessages(conversationId, cursor);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessageController = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const senderRole = req.user.role;

    const {
      conversationId,
      text,
      type,
      interviewDate,
      interviewTime,
      interviewLink,
      assignmentTitle,
      assignmentDescription,
      assignmentDeadline,
      submissionLink,
      submissionNote,
      assignmentRefId,
    } = req.body;

    const msg = await sendMessage({
      conversationId,
      senderId,
      senderRole,
      text,
      type,
      interviewDate,
      interviewTime,
      interviewLink,
      assignmentTitle,
      assignmentDescription,
      assignmentDeadline,
      submissionLink,
      submissionNote,
      assignmentRefId,
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const markAsRead = async (req, res) => {
  try {
    const { conversationId, role } = req.body;

    await markConversationAsRead(conversationId, role);

    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('message:read', { conversationId, role });

      // Also emit to the user's personal room to update unread badge on their header
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        let userId = null;
        if (role === 'employer') {
          const emp = await Employer.findById(conversation.employerId);
          if (emp) userId = emp.userId;
        } else if (role === 'candidate') {
          const cand = await Candidate.findById(conversation.candidateId);
          if (cand) userId = cand.userId;
        }
        if (userId) {
          io.to(`user:${userId}`).emit('message:read', {
            conversationId,
            role,
          });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
