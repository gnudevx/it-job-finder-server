import mongoose from 'mongoose';

const ParsedResumeSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      unique: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },

    skills: [String],

    totalYearsExperience: {
      type: Number,
      default: 0,
    },

    detectedRole: {
      type: String,
      default: '',
    },

    rawText: {
      type: String,
      required: true,
    },

    language: {
      type: String, // "vi" | "en"
      default: 'unknown',
    },
    summary: {
      type: String,
      default: '',
    },
    shortSummary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

ParsedResumeSchema.index({ skills: 1 });

export default mongoose.model(
  'ParsedResume',
  ParsedResumeSchema,
  'PARSED_RESUMES',
);
