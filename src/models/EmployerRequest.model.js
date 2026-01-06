import mongoose from 'mongoose';

const EmployerRequestSchema = new mongoose.Schema(
  {
    employerId: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ['SUPPORT', 'POST_APPROVAL', 'PAYMENT', 'OTHER'],
      default: 'OTHER',
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

export default mongoose.model('EmployerRequest', EmployerRequestSchema);
