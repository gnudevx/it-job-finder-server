// models/company.model.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên công ty hoặc hộ KD
  taxCode: { type: String, required: true },

  website: { type: String, default: '' },

  // giữ cả 2 để tương thích: field (front-end) và industry (backend)
  field: { type: String, default: '' }, // <-- trường bạn thiếu
  industry: { type: String, default: '' }, // optional, có thể dùng chung với field

  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small',
  },

  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, required: true },
  logo: {
    type: String,
    default: '',
  },

  description: { type: String, default: '' },

  type: {
    type: String,
    enum: ['enterprise', 'business'],
    default: 'enterprise',
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('COMPANY', companySchema, 'COMPANY');
