import AuthLog from '../models/authLog.model.js';

export const getAuthLogs = async (req, res) => {
  const userId = req.user.userId; // từ authMiddleware

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const logs = await AuthLog.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await AuthLog.countDocuments({ userId });

  res.json({
    data: logs,
    pagination: {
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
};
