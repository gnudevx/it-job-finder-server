import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: [
        'application_submitted',
        'application_status_changed',
        'new_candidate_applied',
        'system',
      ],
      default: 'system',
    },

    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model(
  'Notification',
  NotificationSchema,
  'NOTIFICATIONS',
);
export default Notification;
