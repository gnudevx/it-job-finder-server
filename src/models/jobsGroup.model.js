import mongoose from "mongoose";

const jobItemSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: String,
  link: String,
  location: String,
  experience: Number,
  description: String,
  requirements: String,
  benefits: String,
  work_location_detail: String,
  working_time: String,
  deadline: String,
  salary_raw: String,
  salary_normalized: Number,
  currency_unit: String,
  skills: [String],
});

const jobsGroupSchema = new mongoose.Schema(
  {
    group: { type: String, required: true },
    jobs: [jobItemSchema],
  },
  { timestamps: true }
);

// tên collection là "jobs"
export default mongoose.model("JobsGroup", jobsGroupSchema, "jobs");
