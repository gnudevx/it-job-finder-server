import company from '../models/company.model.js';
import Employer from '../models/employer.model.js';
import mongoose from 'mongoose';
export const findCompanyByEmployer = async (userId) => {
  const emp = await Employer.findOne({ userId }).populate('companyId');

  return emp?.companyId || null;
};
export const getLatestCompanies = async (limit = 6) => {
  return await company.find({}).sort({ createdAt: -1 }).limit(limit).lean();
};
export const createCompanyService = async (userId, data) => {
  const newCompany = await company.create({
    name: data.companyName,
    taxCode: data.taxCode,
    website: data.website,
    size: data.size,
    address: data.address,
    phone: data.phone,
    email: data.email,
    avatar: data.avatar,
    description: data.description,
    type: data.type,
    field: data.field,
  });

  // Update employer và lấy kết quả
  const updatedEmployer = await Employer.findOneAndUpdate(
    { userId }, // tìm employer theo userId
    { companyId: newCompany._id },
    { new: true },
  );

  // Return cả 2 nếu muốn frontend biết employer
  return { company: newCompany, Employer: updatedEmployer };
};

export const updateCompanyService = async (companyId, data) => {
  return await company.findByIdAndUpdate(
    companyId,
    {
      name: data.companyName,
      taxCode: data.taxCode,
      website: data.website,
      size: data.size,
      address: data.address,
      phone: data.phone,
      email: data.email,
      avatar: data.avatar,
      description: data.description,
      type: data.type,
      field: data.field,
    },
    { new: true },
  );
};

export const assignCompanyToEmployer = async (userId, companyId) => {
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new Error('companyId không hợp lệ');
  }

  const updatedEmployer = await Employer.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { companyId: new mongoose.Types.ObjectId(companyId) },
    { new: true },
  );

  return updatedEmployer;
};

export const getCompanyByEmployerIdService = async (employerId) => {
  const employer = await Employer.findById(employerId).populate('companyId');

  if (!employer || !employer.companyId) {
    throw new Error('Company not found');
  }

  return employer.companyId;
};
