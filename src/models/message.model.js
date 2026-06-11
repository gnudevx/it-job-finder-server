// models/message.model.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      // Không required vì call log không có sender cụ thể
    },
    // ── Text message ──────────────────────────
    text: {
      type: String,
    },
    // ── Call message ──────────────────────────
    type: {
      type: String,
      enum: [
        'text',
        'call',
        'file',
        'interview',
        'assignment',
        'assignment_submit',
      ],
      default: 'text',
    },
    interviewDate: {
      type: Date,
    },
    interviewTime: {
      type: String,
    },
    interviewLink: {
      type: String,
    },
    assignmentTitle: {
      type: String,
    },
    assignmentDescription: {
      type: String,
    },
    assignmentDeadline: {
      type: Date,
    },
    submissionLink: {
      type: String,
    },
    submissionNote: {
      type: String,
    },
    assignmentRefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    file: {
      url: String,
      name: String,
      size: Number,
      mimeType: String,
    },
    callStatus: {
      type: String,
      enum: ['completed', 'missed', 'declined', 'ongoing'],
    },
    callDuration: {
      type: Number, // giây
      default: 0,
    },
    callStartTime: {
      type: Date,
    },
    callEndTime: {
      type: Date,
    },
    callInitiatorId: {
      type: mongoose.Schema.Types.ObjectId, // ai là người gọi
    },
  },
  { timestamps: true },
);

export default mongoose.model('Message', MessageSchema, 'MESSAGES');
