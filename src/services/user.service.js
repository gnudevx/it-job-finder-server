import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import AccountActivity from '../models/accountActivity.model.js';
export const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
};

export const changePasswordService = async (userId, newPassword) => {
  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Cập nhật passwordHash
  const user = await User.findByIdAndUpdate(
    userId,
    { passwordHash: hashedPassword },
    { new: true },
  );
  await AccountActivity.create({
    userId: userId,
    action: 'CHANGE_PASSWORD',
  });
  if (!user) throw new Error('User not found');

  return user;
};
