import candidateService from '../services/candidate.service.js';

// Create
export const createCandidate = async (req, res) => {
  try {
    const candidate = await candidateService.createCandidate(req.body);
    return res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Lỗi khi tạo ứng viên', error: error.message });
  }
};

// Read all
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

// Read by id
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
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

// Read my profile
export const getMyInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
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

// Update my profile
export const updateCandidate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // Find candidate by userId
    const candidate = await candidateService.getMyInfo(userId);
    if (!candidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên' });
    }

    // Update allowed fields only
    const allowedFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'birthday',
      'gender',
      'avatar',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        candidate[field] = updates[field];
      }
    });

    await candidate.save();

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

// Delete
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await candidateService.deleteCandidate(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên' });
    }
    return res.json({ success: true, message: 'Xóa hồ sơ thành công' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Lỗi server', error: error.message });
  }
};
