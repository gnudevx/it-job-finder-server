// models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['SYSTEM', 'FEATURE', 'PROMOTION', 'ALERT'],
      default: 'SYSTEM',
    },
    recipientRole: {
      type: String,
      enum: ['CANDIDATE', 'EMPLOYER'],
      required: true,
    },
    // Nếu gửi riêng tư thì điền ID, gửi tất cả thì để null hoặc "ALL"
    recipientId: { type: String, index: true },
    createdBy: { type: String, default: null },
  },
  { timestamps: true },
);

// Đánh index để query nhanh: Tìm thông báo cho 1 user cụ thể hoặc thông báo chung
NotificationSchema.index({ recipientId: 1, recipientRole: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
