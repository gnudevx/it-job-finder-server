import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employer',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    jobId: {
      // THÊM CÁI NÀY
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobs',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },

    lastMessageTime: {
      type: Date,
    },

    unreadCount: {
      employer: { type: Number, default: 0 },
      candidate: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// ❗ đảm bảo 1 cặp chỉ có 1 conversation
ConversationSchema.index({ employerId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model(
  'Conversation',
  ConversationSchema,
  'CONVERSATIONS',
);
