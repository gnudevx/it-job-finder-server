import {
  getOrCreateConversation,
  getConversationsByCandidate,
  getApplicationsByCandidate,
} from '../services/conversation.service.js';
import Candidate from '../models/candidate.model.js';
export const getCandidateConversations = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user.userId });
    const candidateId = candidate._id;

    const data = await getConversationsByCandidate(candidateId);

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
