import Candidate from '../models/candidate.model.js';

class CandidateService {
  async loadAllCandidate() {
    return Candidate.find();
  }

  async getMyInfo(userId) {
    return Candidate.findOne({ userId });
  }

  async updateCandidate(userId, updates) {
    return Candidate.findOneAndUpdate({ userId }, updates, { new: true });
  }
}

export default new CandidateService();
