import Candidate from '../models/candidate.model.js';
import User from '../models/User.js';

class CandidateService {
  async createCandidate(data) {
    const { email, ...rest } = data;

    if (!email) {
      throw new Error('Email là bắt buộc để liên kết với User');
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`Không tìm thấy User với email: ${email}`);
    }

    // Gán userId từ User tìm được
    const candidateData = {
      ...rest,
      email, // giữ email trong candidate nếu cần
      userId: user._id,
    };

    return Candidate.create(candidateData);
  }

  async loadAllCandidate() {
    return Candidate.find();
  }

  async getCandidateById(id) {
    return Candidate.findById(id);
  }

  async getMyInfo(userId) {
    return Candidate.findOne({ userId });
  }

  async updateCandidate(candidateId, updates) {
    // Chỉ cho phép update những trường nhất định
    const allowedFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'birthday',
      'gender',
    ];
    const filteredUpdates = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    return Candidate.findByIdAndUpdate(candidateId, filteredUpdates, {
      new: true,
    });
  }

  async deleteCandidate(id) {
    return Candidate.findByIdAndDelete(id);
  }
}

export default new CandidateService();
