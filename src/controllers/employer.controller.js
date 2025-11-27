import { findEmployer } from '../services/employer.service.js';
import Employer from '../models/employer.model.js';
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const employer = await findEmployer(userId);

    if (!employer) {
      return res.status(404).json({ message: 'Không tìm thấy employer!' });
    }

    return res.json({ user: employer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const data = req.body;

    // Cập nhật thông tin employer dựa vào userId từ JWT
    const updated = await Employer.findOneAndUpdate(
      { userId: req.user.userId },
      data,
      { new: true }, // trả về bản cập nhật mới
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy employer!' });
    }

    return res.json({ message: 'Cập nhật thành công!', user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
