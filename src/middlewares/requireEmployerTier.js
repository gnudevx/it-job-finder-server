import Employer from '../models/employer.model.js';

export const requireEmployerTier = ({
  allowedTiers = [],
  message = 'Gói hiện tại không hỗ trợ tính năng này.',
} = {}) => {
  return async (req, res, next) => {
    try {
      const employer = await Employer.findOne({ userId: req.user.userId });

      if (!employer) {
        return res.status(404).json({ message: 'Không tìm thấy employer' });
      }

      if (
        employer.subscriptionExpiresAt &&
        employer.subscriptionExpiresAt < new Date()
      ) {
        employer.tier = 'FREE';
        employer.subscriptionExpiresAt = null;
        await employer.save();
      }

      const currentTier = employer.tier || 'FREE';
      req.employer = employer;

      if (allowedTiers.length > 0 && !allowedTiers.includes(currentTier)) {
        return res.status(403).json({ message });
      }

      next();
    } catch (error) {
      console.error('Require employer tier error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};
