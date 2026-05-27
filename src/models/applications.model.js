import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobs',
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },

    note: {
      type: String,
      default: '',
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ['applied', 'reviewed', 'interviewing', 'rejected', 'hired'],
      default: 'applied',
    },

    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// không cho ứng viên apply 1 job 2 lần
ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model(
  'Application',
  ApplicationSchema,
  'APPLICATIONS',
);
export default Application;
