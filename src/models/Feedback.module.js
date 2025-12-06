import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employer',
      required: true,
    },

    category: { type: String, required: true },
    content: { type: String, required: true },

    files: [
      {
        fileUrl: String,
        fileName: String,
        fileType: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved'],
      default: 'pending',
    },
    replies: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        sender: { type: String, enum: ['ADMIN', 'USER'], required: true },
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model('Feedback', FeedbackSchema);
