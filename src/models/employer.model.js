import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'USER', required: true },

  phone: { type: String, default: '' },
  phoneVerified: { type: Boolean, default: false }, // ⬅ thêm dòng này

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'COMPANY',
  },

  fullName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },

  license: {
    fileUrl: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    uploadedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },

  address: { type: String, default: '' },
  avatar: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('employer', employerSchema, 'employer');
