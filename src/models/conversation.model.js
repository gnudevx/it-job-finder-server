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
