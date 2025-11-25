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

    work_location_detail: String,
    working_time: String,
    deadline: Date,
    salaryFrom: String,
    salaryTo: String,
    salary_raw: String,
    salary_normalized: Number,
    currency_unit: String,

    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    ageRange: String,
    education: String,
    gender: String,
    mustHaveSkills: [{ value: String, label: String }],
    optionalSkills: [{ value: String, label: String }],
    domainKnowledge: [String],
    languages: [{ value: String, label: String }],
    softSkills: [String],
    portfolioRequired: Boolean,
    receiverName: String,
    receiverEmail: String,
    receiverPhone: String,
    receiverAddress: String,
    allowOnlineApply: Boolean,
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobGroup' },
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Jobs', jobSchema, 'jobs');
