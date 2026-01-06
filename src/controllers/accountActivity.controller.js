import AccountActivity from '../models/accountActivity.model.js';

export const getAccountActivities = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const filter = { userId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const activities = await AccountActivity.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Cannot fetch account activities',
      err,
    });
  }
};
