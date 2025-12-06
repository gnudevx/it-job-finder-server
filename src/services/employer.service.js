import Employer from '../models/employer.model.js';
import Jobs from '../models/jobs.model.js';
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
export async function getAllEmployersService() {
  // Lấy tất cả employer, populate user và company
  const employers = await Employer.find()
    .populate('userId') // lấy email, status, ...
    .populate('companyId') // lấy name, logo, description, ...
    .lean();
  console.log('Employers:', employers);
  return employers.map((e) => ({
    id: e._id.toString(),

    // Company / Contact
    companyName: e.companyId?.name || 'Chưa cập nhật',
    logoUrl: e.companyId?.logoUrl || '',
    contactName: e.fullName || '',
    email: e.userId?.email || '',
    phone: e.phone || '',

    // Package / Tier
    tier: e.tier || 'FREE',

    // Status -> lấy từ USER (userId)
    status: (e.userId?.status || 'active').toUpperCase(),

    // Credits
    creditBalance: e.creditBalance ?? 0,

    // Optional
    joinedDate: e.createdAt ? e.createdAt.toISOString().slice(0, 10) : null,
  }));
}

/** LẤY EMPLOYER THEO ID */
export async function getEmployerByIdService(employerId) {
  const employer = await Employer.findById(employerId)
    .populate('companyId')
    .populate('userId')
    .lean();

  if (!employer) return null;

  const jobs = await Jobs.find({ employer_id: employer._id })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  return {
    id: employer._id.toString(),
    companyName: employer.companyId?.name || 'Chưa cập nhật',
    userId: employer.userId._id.toString(),
    logoUrl: employer.companyId?.logoUrl || '',
    industry: employer.companyId?.industry || '',
    joinedDate: employer.createdAt?.toISOString().slice(0, 10),
    contactName: employer.fullName || '',
    email: employer.userId?.email || '',
    phone: employer.phone || '',
    status: (employer.userId?.status || 'active').toUpperCase(),
    tier: employer.tier || 'FREE',
    creditBalance: employer.creditBalance ?? 0,
    description: employer.companyId?.description || '',
    avatar: employer.avatar || '',
    address: employer.address || '',
    jobs: jobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      postedDate: j.createdAt ? j.createdAt.toISOString().slice(0, 10) : null,
      views: j.totalDisplay ?? 0,
      status: j.publishStatus === 'approved' ? 'Open' : j.publishStatus,
    })),
  };
}

export const loadAllEmployer = async () => {
  return Employer.find()
    .populate('companyId') // populate các field cần thiết
    .exec();
};
