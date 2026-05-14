import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },

    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, default: 'pdf' }, // pdf | docx …
    size: { type: Number, required: true },
    embedding: {
      type: [Number],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },

    isDefault: { type: Boolean, default: false }, // CV mặc định
  },
  {
    timestamps: true,
  },
);

const Resume = mongoose.model('Resume', ResumeSchema, 'RESUMES');
export default Resume;
