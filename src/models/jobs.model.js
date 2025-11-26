import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: String,
    link: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },

    experience: String,
    description: String,
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
    deadline: Date,
    salaryFrom: String,
    salaryTo: String,
    salary_raw: String,
    currency_unit: String,

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
    receiverAddress: String,
    allowOnlineApply: Boolean,
    jobType: String,
    quantity: Number,
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobGroup' },
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      default: new mongoose.Types.ObjectId('64e2b9b2d3f4a7c1e3b12345'),
    },
    visibility: {
      type: String,
      enum: ['hidden', 'visible', 'expired'],
      default: 'visible',
    },
    publishStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'approved',
    },
    service: { type: String, default: null },
    latestDisplay: { type: String, default: null },
    totalDisplay: { type: String, default: null },
    display_expired_at: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Jobs', jobSchema, 'jobs');
