import Employer from '../models/employer.model.js';
export const findEmployer = async (userId) => {
  const employer = await Employer.findOne({ userId });
  return employer; // chỉ trả về dữ liệu, không res.json ở đây
};

export const loadAllEmployer = async () => {
  return Employer.find()
    .populate('companyId') // populate các field cần thiết
    .exec();
};
