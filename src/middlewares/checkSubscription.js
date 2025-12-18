import Employer from '../models/employer.model.js';

export const checkSubscription = async (req, res, next) => {
  const employer = await Employer.findOne({ userId: req.user.userId });

  if (
    employer?.subscriptionExpiresAt &&
    employer.subscriptionExpiresAt < new Date()
  ) {
    employer.tier = 'FREE';
    employer.subscriptionExpiresAt = null;
    await employer.save();
  }

  next();
};
