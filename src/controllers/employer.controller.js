import {
  findEmployer,
  loadAllEmployer,
  updateLicenseService,
  verifyPhoneService,
  getEmployerProgressService,
} from '../services/employer.service.js';
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

export const uploadLicenseController = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/licenses/${req.file.filename}`;

    const updatedEmployer = await updateLicenseService(userId, fileUrl);

    if (!updatedEmployer)
      return res.status(404).json({ message: 'Không tìm thấy employer' });

    res.json({
      message: 'Upload license thành công',
      license: updatedEmployer.license,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLicenseInfo = async (req, res) => {
  try {
    const userId = req.user.userId;

    const employer = await Employer.findOne({ userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.json({
      license: employer.license,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyPhoneController = async (req, res) => {
  try {
    // Lấy user ID từ token
    const employerUserId = req.user.userId;

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Thiếu số điện thoại.' });
    }

    // Kiểm tra employer tồn tại
    const employer = await Employer.findOne({ userId: employerUserId });
    if (!employer) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy nhà tuyển dụng.' });
    }

    // Gọi service
    const result = await verifyPhoneService(employer._id, phone);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.json({
      message: result.message,
      employer: result.employer,
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const getEmployerProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await getEmployerProgressService(userId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.json({ steps: result.steps });
  } catch (err) {
    console.error('getEmployerProgress error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const AllEmployer = async (req, res) => {
  try {
    const data = await loadAllEmployer();
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
