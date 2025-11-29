import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },

    address: { type: String, default: '' },
    birthday: { type: String, default: '' }, // hoặc type: Date nếu bạn muốn
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },

    avatar: { type: String, default: '' },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Candidate = mongoose.model('Candidate', CandidateSchema, 'CANDIDATES');
export default Candidate;
