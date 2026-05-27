import { applyToJob } from '../services/applyJobs.service.js';
import Candidate from '../models/candidate.model.js';
import Application from '../models/applications.model.js';
import { parseAndSaveResume } from '../services/parseResume.service.js';
export const applyJobController = async (req, res) => {
  try {
    const { jobId, resumeId, note } = req.body;

    if (!jobId || !resumeId) {
      return res
        .status(400)
        .json({ message: 'jobId and resumeId are required' });
    }

    // Lấy userId từ JWT (req.user.id)
    const userId = req.user.userId;

    // Tìm candidate dựa vào userId
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const application = await applyToJob({
      candidateId: candidate._id, // đây mới là Candidate._id
      jobId,
      resumeId,
      note,
    });
    parseAndSaveResume(resumeId)
      .then(() => {
        console.log('Resume parsed successfully:', resumeId);
      })
      .catch((err) => {
        console.error('Resume parse failed:', err.message);
      });
    return res.status(201).json({
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Something went wrong',
    });
  }
};

export const getMyAppliedJobsController = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const candidate = await Candidate.findOne({ userId });
    if (!candidate)
      return res.status(404).json({ message: 'Candidate not found' });

    const applications = await Application.find({ candidateId: candidate._id })
      .populate({
        path: 'jobId',
        populate: [
          { path: 'location', model: 'Location', strictPopulate: false },
          { path: 'group_id', model: 'JobGroup', strictPopulate: false },
          { path: 'employer_id', model: 'employer', strictPopulate: false },
        ],
      })
      .populate('resumeId');

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
