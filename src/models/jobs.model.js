import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: String,
    link: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },

    experience: String,
    description: String,
    requirements: [String],
    benefits: [String],

    work_location_detail: String,
    working_time: String,
    deadline: Date,

    salary_raw: String,
    salary_normalized: Number,
    currency_unit: String,

    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],

    group_id: { type: mongoose.Schema.Types.ObjectId, ref: "JobGroup" },
    employer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Jobs", jobSchema, "jobs");