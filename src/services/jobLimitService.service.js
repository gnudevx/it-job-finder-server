// services/jobLimitService.js
import moment from 'moment';
import Employer from '../models/employer.model.js';
import Job from '../models/jobs.model.js';

export const getJobLimitStatus = async (employerUserId) => {
  const employer = await Employer.findOne({ userId: employerUserId });

  if (!employer) {
    throw new Error('Employer không tồn tại');
  }

  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();

  const jobCountThisMonth = await Job.countDocuments({
    employer_id: employer._id,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    publishStatus: { $in: ['approved', 'pending'] }, // chiếm slot
    visibility: { $in: ['visible', 'hidden'] }, // optional: hidden cũng chiếm slot
  });

  const jobLimit = employer.maxPosts;

  return {
    employer,
    remaining: jobLimit - jobCountThisMonth,
    limitReached: jobCountThisMonth >= jobLimit,
    postedThisMonth: jobCountThisMonth,
    maxPosts: jobLimit,
    tier: employer.tier,
  };
};
