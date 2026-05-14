import {
  recommendJobsService,
  recommendCvsForJob,
} from '../services/recommend.service.js';
import mongoose from 'mongoose';

export const getRecommendedJobs = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid jobId',
      });
    }

    const jobs = await recommendJobsService(jobId);

    return res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Recommend error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getRecommendedCvs = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid jobId',
      });
    }

    const cvs = await recommendCvsForJob(jobId);

    return res.json({
      success: true,
      data: cvs,
    });
  } catch (error) {
    console.error('Recommend CV error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
