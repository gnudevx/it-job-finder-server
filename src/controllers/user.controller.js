import User from '../models/User.js';

export const getPersonalInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'fullName email phone role',
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

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone },
      { new: true },
    ).select('fullName email phone role');

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
