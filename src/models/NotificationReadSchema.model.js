import mongoose from 'mongoose';

const NotificationReadSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
    },
    userId: { type: String, required: true }, // Employer ID
    readAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }, // Nếu user muốn xóa thông báo khỏi list của họ
  },
  { timestamps: true },
);

// Index ghép để check nhanh xem User A đã đọc Thông báo B chưa
NotificationReadSchema.index(
  { userId: 1, notificationId: 1 },
  { unique: true },
);

export default mongoose.model('NotificationRead', NotificationReadSchema);
