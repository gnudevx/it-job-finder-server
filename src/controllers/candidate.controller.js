import Candidate from '../models/candidate.model.js';

export const getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ userId });
    if (!candidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên' });
    }

    return res.json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const candidate = await Candidate.findOneAndUpdate({ userId }, updates, {
      new: true,
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên' });
    }

    return res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: candidate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Lỗi server', error: error.message });
  }
};
