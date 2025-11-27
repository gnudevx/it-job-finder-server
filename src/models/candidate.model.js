import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },

    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    experienceYears: { type: Number, default: 0 },
    resumeLink: { type: String, default: '' },
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
