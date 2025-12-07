import Jobs from '../models/jobs.model.js';
import Employer from '../models/employer.model.js';
import User from '../models/User.js';

// HÀM LẤY NGÀY 7 NGÀY TRƯỚC
function getLast7Days() {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  return { today, sevenDaysAgo };
}

// SERVICE: SUMMARY
export const getDashboardSummaryService = async () => {
  const totalJobs = await Jobs.countDocuments();

  const { sevenDaysAgo } = getLast7Days();
  const newEmployers = await Employer.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const pendingApproval = await Employer.countDocuments({
    'license.status': 'pending',
  });

  const verifiedCompanies = await Employer.countDocuments({
    'license.status': 'approved',
  });

  return {
    totalJobs,
    newEmployers,
    pendingApproval,
    verifiedCompanies,
  };
};

// SERVICE: JOB STATS (7 ngày)
export const getJobStatsService = async () => {
  const { sevenDaysAgo, today } = getLast7Days();

  const stats = await Jobs.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo, $lte: today } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return stats;
};

// SERVICE: USER GROWTH
export const getUserGrowthService = async () => {
  const { sevenDaysAgo, today } = getLast7Days();

  const stats = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo, $lte: today } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return stats;
};

export const getEmployerStatsService = async () => {
  // 1. Nhà tuyển dụng mới 7 ngày gần nhất
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newEmployers = await Employer.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // 2. Hồ sơ chờ duyệt (pending jobs)
  const pendingApproval = await Jobs.countDocuments({
    publishStatus: 'pending',
  });

  // 3. Doanh nghiệp đã xác thực (license approved)
  const verifiedCompanies = await Employer.countDocuments({
    'license.status': 'approved',
  });

  return {
    newEmployers,
    pendingApproval,
    verifiedCompanies,
  };
};
