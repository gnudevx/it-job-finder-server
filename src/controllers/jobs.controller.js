import Job from "../models/jobs.model.js";

// Lấy toàn bộ job (dạng phẳng)
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("location")
      .populate("skills")
      .populate("group_id")
      .populate("employer_id");

    return res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Lấy job theo group name (nếu cần)
export const getJobsGroup = async (req, res) => {
  try {
    const groupName = req.params.group;

    const jobs = await Job.find()
      .populate("group_id")
      .populate("location")
      .populate("skills")
      .populate("employer_id");

    const filtered = jobs.filter(job => job.group_id?.group === groupName);

    if (filtered.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: filtered
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
