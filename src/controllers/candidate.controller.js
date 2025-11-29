import candidateService from '../services/candidate.service.js';

export const loadAllCandidate = async (req, res) => {
  try {
    const data = await candidateService.loadAllCandidate();
    return res.json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Lỗi server', error: error.message });
  }
};

export const getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await candidateService.getMyInfo(userId);

    if (!candidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên' });
    }

    return res.json({ success: true, data: candidate });
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

    const candidate = await candidateService.updateCandidate(userId, updates);

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
