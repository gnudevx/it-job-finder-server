import User from '../models/user.model.js';
export const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
};
