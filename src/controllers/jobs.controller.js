import Job from '../models/jobs.model.js';
import * as jobService from '../services/jobs.service.js';
import Employer from '../models/employer.model.js';

// Lấy toàn bộ job (dạng phẳng)
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('location')
      .populate('skills')
      .populate('group_id')
      .populate('employer_id');

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Lấy job theo group name (nếu cần)
export const getJobsGroup = async (req, res) => {
  try {
    const groupName = req.params.group;

    const jobs = await Job.find()
      .populate('group_id')
      .populate('location')
      .populate('skills')
      .populate('employer_id');

    const filtered = jobs.filter((job) => job.group_id?.group === groupName);

    if (filtered.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: filtered,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const createJob = async (req, res, next) => {
  try {
    const employerUserId = req.user.userId; // 🔹 user id từ token
    console.log('Employer User ID:', employerUserId);
    // Kiểm tra employer tồn tại
    const employer = await Employer.findOne({ userId: employerUserId });
    console.log('Employer:', employer);
    if (!employer) {
      return res.status(404).json({ message: 'Employer không tồn tại' });
    }

    // Gọi service tạo job, truyền employer._id
    const job = await jobService.createJobService(req.body, employer._id);
    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    res.json({
      success: true,
      job: updatedJob,
      message: 'Cập nhật thành công',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
};
export const getAllJobsHistory = async (req, res) => {
  try {
    const employerId = req.query.employer_id;

    if (!employerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing employer_id',
      });
    }

    const jobs = await Job.find({ employer_id: employerId }).lean();

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
