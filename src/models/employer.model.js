import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'USER', required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'COMPANY',
  },

  fullName: { type: String, required: true },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('employer', employerSchema, 'employer');
