import User from '../models/User.js';

class UserService {
  async updatePersonalInfo(userId, data) {
    const { fullName, phone } = data;

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.fullName = fullName;
    user.phone = phone;

    await user.save();

    return user;
  }
}

export default new UserService();
