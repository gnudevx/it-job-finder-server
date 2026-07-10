import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getPersonalInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'fullname email phone role',
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const normalizedName = fullName || req.body.fullname || '';

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { fullname: normalizedName, phone },
      { new: true },
    ).select('fullname email phone role');

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    return res.json({
      success: true,
      message: 'Cập nhật thông tin user thành công',
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Mật khẩu hiện tại và mật khẩu mới không được để trống',
      });
    }

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.passwordHash) {
      return res
        .status(400)
        .json({ message: 'User không có passwordHash trong DB' });
    }

    // kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: 'Mật khẩu hiện tại không chính xác!' });

    if (!user.fullname) {
      user.fullname = user.email?.split('@')[0] || 'User';
    }

    // hashing mật khẩu mới
    user.passwordHash = await bcrypt.hash(newPassword, 10);

    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};
