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
