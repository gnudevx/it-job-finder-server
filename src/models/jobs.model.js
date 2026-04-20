import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: String,
    link: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },

    experience: String,
    jobDescription: String,
    requirements: [String],
    benefits: [String],
    level: String,
    work_location_detail: String,
    specialization: String,
    working_time: {
      dayFrom: { type: String },
      dayTo: { type: String },
      timeFrom: { type: String },
      timeTo: { type: String },
    },
    applicationDeadline: Date,
    salaryFrom: String,
    salaryTo: String,
    salary_raw: String,
    currency_unit: String,
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        default: [],
      },
    ],

    ageRange: String,
    education: String,
    gender: String,
    mustHaveSkills: [String],
    optionalSkills: [String],
    domainKnowledge: [String],
    languages: [String],
    portfolioRequired: Boolean,
    receiverName: String,
    receiverEmail: String,
    receiverPhone: String,
    allowOnlineApply: Boolean,
    jobType: String,
    quantity: Number,
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobGroup' },
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employer',
    },
    visibility: {
      type: String,
      enum: ['hidden', 'visible', 'expired'],
      default: 'hidden',
    },
    publishStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'paused'],
      default: 'pending',
    },
    service: { type: String, default: null },
    latestDisplay: { type: String, default: null },
    totalDisplay: { type: String, default: null },
    display_expired_at: { type: Date, default: null },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model('jobs', jobSchema, 'jobs');
