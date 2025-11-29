import mongoose from 'mongoose';
import Employer from '../models/employer.model.js';
import Company from '../models/company.model.js';

const { ObjectId } = mongoose.Types;

await mongoose.connect('mongodb://localhost:27017/ITJOBS');
console.log('Connected');

// 1. Lấy Company có sẵn (hoặc bạn create mới)
const company = await Company.findOne();
// hoặc: await Company.create({ name: "VNG" });

// 2. Tạo Employer
const employer = await Employer.create({
  userId: new ObjectId('6925bbdb67c2065dd0513cba'),
  companyId: company._id,
  fullName: 'Nguyễn Văn HR',
  gender: 'male',
  phone: '0389355133',
});

console.log('DONE', { employer });
process.exit();
