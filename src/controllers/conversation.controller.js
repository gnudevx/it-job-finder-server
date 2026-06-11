import {
  getOrCreateConversation,
  getConversationsByEmployer,
  getApplicationsByEmployer,
  getConversationById,
} from '../services/conversation.service.js';
import Employer from '../models/employer.model.js';
import Conversation from '../models/conversation.model.js';
export const getEmployerConversations = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.userId });
    const employerId = employer._id;
    console.log('employerId', employerId);
    if (!employerId) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found',
      });
    }
    const data = await getConversationsByEmployer(employerId);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.userId });
    const employerId = employer._id;

    const { candidateId, jobId } = req.body;

    const convo = await getOrCreateConversation({
      employerId,
      candidateId,
      jobId,
    });

    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCandidate = async (req, res) => {
  try {
    // 1. lấy employer từ user
    const employer = await Employer.findOne({
      userId: req.user.userId,
    });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found',
      });
    }

    // 2. dùng employer._id (QUAN TRỌNG)
    const applications = await getApplicationsByEmployer(employer._id);

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getConversationDetails = async (req, res) => {
  try {
    const convoId = req.params.id;
    const convo = await getConversationById(convoId, 'employer');
    if (!convo) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployerUnreadCount = async (req, res) => {
  try {
    const employer = await Employer.findOne({
      userId: req.user.userId || req.user.id,
    });
    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: 'Employer not found' });
    }
    const conversations = await Conversation.find({ employerId: employer._id });
    const totalUnread = conversations.reduce(
      (sum, c) => sum + (c.unreadCount?.employer || 0),
      0,
    );
    res.json({ unreadCount: totalUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
