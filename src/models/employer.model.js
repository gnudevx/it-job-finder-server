import mongoose from 'mongoose';

const tierConfig = {
  FREE: { maxPosts: 3 },
  PRO: { maxPosts: 10 },
  ENTERPRISE: { maxPosts: 100 },
};
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
      ref: 'admin',
      default: null,
    },
  },
  tier: {
    type: String,
    enum: ['FREE', 'PRO', 'ENTERPRISE'],
    default: 'FREE',
  },
  creditBalance: { type: Number, default: 0 }, // số tin còn lại
  maxPosts: {
    type: Number,
    default: function () {
      return tierConfig[this.tier]?.maxPosts ?? 3;
    },
  },
  lastPostAt: { type: Date, default: null }, // ngày đăng tin gần nhất
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  subscriptionExpiresAt: {
    type: Date,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});
employerSchema.pre('save', function (next) {
  if (this.isModified('tier')) {
    this.maxPosts = tierConfig[this.tier]?.maxPosts ?? 3;
  }
  next();
});

export default mongoose.model('employer', employerSchema, 'employer');
