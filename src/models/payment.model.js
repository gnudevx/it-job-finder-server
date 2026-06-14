// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  tier: {
    type: String,
    enum: ['FREE', 'PRO', 'ENTERPRISE'],
    required: true,
  },

  amount: {
    type: Number,
    default: 0, // fake payment => 0
  },

  provider: {
    type: String,
    enum: ['MOMO', 'STRIPE', 'VNPAY', 'COD'],
    default: 'MOMO',
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'approved', 'rejected'],
    default: 'pending',
  },

  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null }, // NGÀY BẮT ĐẦU
  expiresAt: { type: Date, default: null }, // NGÀY HẾT HẠN
});

export default mongoose.model('PAYMENT', paymentSchema, 'PAYMENT');
