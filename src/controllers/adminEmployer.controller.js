import {
  getAllEmployersService,
  getEmployerByIdService,
} from '../services/employer.service.js';
import User from '../models/User.js';
import Employer from '../models/employer.model.js';
import moment from 'moment';
import Job from '../models/jobs.model.js';
import { changePasswordService } from '../services/user.service.js';
export const adminEmployerController = {
  getAll: async (req, res) => {
    try {
      const data = await getAllEmployersService();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const employerId = req.params.id; // <-- LẤY EMPLOYER ID ĐÚNG
      console.log('Employer ID từ FE:', employerId);
      const emp = await getEmployerByIdService(employerId);

      if (!emp)
        return res.status(404).json({ message: 'Không tìm thấy employer' });

      return res.json(emp);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
};
export const updateEmployerStatus = async (req, res) => {
  try {
    const { id: employerId } = req.params; // lấy employerId từ URL
    const { status } = req.body;

    console.log('Employer ID từ FE:', employerId);

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Tìm employer
    const employer = await Employer.findById(employerId);
    if (!employer)
      return res.status(404).json({ message: 'Không tìm thấy employer' });

    // Lấy userId từ employer
    const updated = await User.findByIdAndUpdate(
      employer.userId,
      { status },
      { new: true },
    );

    if (!updated)
      return res.status(404).json({ message: 'Không tìm thấy user' });

    return res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// route: PUT /admin/employer/:id/change-password
export const adminChangeEmployerPasswordController = async (req, res, next) => {
  try {
    const { newPassword, reNewPassword } = req.body;
    const { id } = req.params; // id của employer cần đổi mật khẩu

    if (newPassword !== reNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Kiểm tra role admin từ JWT (middleware auth)
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    const employerDoc = await Employer.findById(id);
    if (!employerDoc)
      return res.status(404).json({ message: 'Employer not found' });

    // Đổi mật khẩu user auth
    const user = await changePasswordService(employerDoc.userId, newPassword);
    return res.json({
      message: 'Password updated successfully',
      userId: user._id,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllEmployersWithJobLimit = async (req, res) => {
  try {
    const employers = await Employer.find()
      .populate('userId', 'fullName email status')
      .lean();

    // Loại recruiter bị mất user
    const validEmployers = employers.filter((e) => e.userId);

    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const data = await Promise.all(
      validEmployers.map(async (employer) => {
        const jobCountThisMonth = await Job.countDocuments({
          employer_id: employer._id,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          publishStatus: { $in: ['approved', 'pending'] },
          visibility: { $in: ['visible', 'hidden'] },
        });

        const remaining = employer.maxPosts - jobCountThisMonth;

        return {
          ...employer,
          remaining,
          limitReached: jobCountThisMonth >= employer.maxPosts,
          postedThisMonth: jobCountThisMonth,
        };
      }),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
