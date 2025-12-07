import {
  getDashboardSummaryService,
  getJobStatsService,
  getUserGrowthService,
  getEmployerStatsService,
} from '../services/adminDashboard.service.js';

// SUMMARY
export const getDashboardSummary = async (req, res) => {
  try {
    const data = await getDashboardSummaryService();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// JOB STATS
export const getJobStats = async (req, res) => {
  try {
    const data = await getJobStatsService();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// USER GROWTH
export const getUserGrowth = async (req, res) => {
  try {
    const data = await getUserGrowthService();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployerStats = async (req, res) => {
  try {
    const data = await getEmployerStatsService();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Employer Stats Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
