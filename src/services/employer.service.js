import Employer from '../models/employer.model.js';
import fs from 'fs';

export const findEmployer = async (userId) => {
  const employer = await Employer.findOne({ userId });
  return employer; // chỉ trả về dữ liệu, không res.json ở đây
};

export const updateLicenseService = async (userId, fileUrl) => {
  const employer = await Employer.findOne({ userId });
  if (!employer) return null;

  // xóa file cũ nếu có
  if (employer.license?.fileUrl) {
    const oldPath = `.${employer.license.fileUrl}`;
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // cập nhật file mới + status = pending
  employer.license = {
    fileUrl,
    status: 'pending',
    uploadedAt: new Date(),
    reviewedAt: null,
    reviewedBy: null,
  };

  await employer.save();
  return employer;
};

export const verifyPhoneService = async (employerId, phone) => {
  const normalized = phone.replace(/\D/g, '');

  // Validate
  if (normalized.length < 9 || normalized.length > 12) {
    return { success: false, message: 'Số điện thoại không hợp lệ.' };
  }

  // Kiểm tra số đã được dùng nơi khác
  const existing = await Employer.findOne({
    phone: normalized,
    _id: { $ne: employerId },
  });

  if (existing) {
    return {
      success: false,
      message: 'Số điện thoại đã được nhà tuyển dụng khác xác thực.',
    };
  }

  const employer = await Employer.findByIdAndUpdate(
    employerId,
    {
      phone: normalized,
      phoneVerified: true,
    },
    { new: true },
  );

  return {
    success: true,
    message: 'Số điện thoại đã được xác thực.',
    employer,
  };
};

export async function getEmployerProgressService(userId) {
  // Tìm employer theo userId
  const employer = await Employer.findOne({ userId }).populate('companyId');

  if (!employer) {
    return { success: false, message: 'Không tìm thấy employer' };
  }

  const steps = {
    phoneVerified: employer.phoneVerified,
    companyInfoUpdated: !!employer.companyId,
    licenseUploaded: employer.license?.status === 'approved',
  };

  return { success: true, steps };
}

export const loadAllEmployer = async () => {
  return Employer.find()
    .populate('companyId') // populate các field cần thiết
    .exec();
};
