import {
  getOrCreateConversation,
  getConversationsByCandidate,
  getApplicationsByCandidate,
  getConversationById,
} from '../services/conversation.service.js';
import Candidate from '../models/candidate.model.js';
import Conversation from '../models/conversation.model.js';
export const getCandidateConversations = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user.userId });
    const candidateId = candidate._id;

    const data = await getConversationsByCandidate(candidateId);
    console.log('id candidate: ', data);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user.userId });
    const candidateId = candidate._id;
    const { employerId, jobId } = req.body;

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

export const getCandidateApplications = async (req, res) => {
  try {
    // 1. lấy employer từ user
    const candidate = await Candidate.findOne({
      userId: req.user.userId,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found',
      });
    }

    // 2. dùng employer._id (QUAN TRỌNG)
    const applications = await getApplicationsByCandidate(candidate._id);

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
    const convo = await getConversationById(convoId, 'candidate');
    if (!convo) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCandidateUnreadCount = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      userId: req.user.userId || req.user.id,
    });
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: 'Candidate not found' });
    }
    const conversations = await Conversation.find({
      candidateId: candidate._id,
    });
    const totalUnread = conversations.reduce(
      (sum, c) => sum + (c.unreadCount?.candidate || 0),
      0,
    );
    res.json({ unreadCount: totalUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
