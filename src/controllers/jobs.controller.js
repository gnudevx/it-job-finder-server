import Job from '../models/jobs.model.js';
import * as jobService from '../services/jobs.service.js';
import Employer from '../models/employer.model.js';
import { getJobLimitStatus } from '../services/jobLimitService.service.js';
// Lấy toàn bộ job (dạng phẳng)
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ visibility: 'visible' })
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
    const limit = await getJobLimitStatus(employerUserId);

    if (limit.limitReached) {
      return res.status(403).json({
        message: `Bạn đã đạt giới hạn ${limit.jobLimit} bài của gói ${limit.employer.tier}`,
      });
    }
    // Gọi service tạo job, truyền employer._id
    console.log('Creating job for employer ID:', employer._id);
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
    const employerUserId = req.user.userId;
    console.log('Employer ID:', employerUserId);
    const employer = await Employer.findOne({ userId: employerUserId });
    if (!employer._id) {
      return res.status(400).json({
        success: false,
        message: 'Missing employer_id',
      });
    }

    const jobs = await Job.find({ employer_id: employer._id }).lean();

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const pauseJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        visibility: 'hidden',
        publishStatus: 'paused',
      },
      { new: true },
    );

    if (!updatedJob)
      return res.status(404).json({ success: false, message: 'Job not found' });

    return res.json({
      success: true,
      job: updatedJob,
      message: 'Đã tạm dừng hiển thị tin tuyển dụng',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const resumeJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    console.log('Resuming job ID:', jobId, 'Job found:', job);
    if (!job)
      return res.status(404).json({ success: false, message: 'Job not found' });

    // 3) Kiểm tra thời hạn hiển thị
    if (!job.display_expired_at) {
      return res.status(400).json({
        success: false,
        message: 'Tin chưa có thời gian hiển thị. Vui lòng đăng/duyệt lại.',
      });
    }
    const now = new Date();
    const expiredAt = new Date(job.display_expired_at);

    if (expiredAt < now) {
      // Đã hết hạn => không cho phép resume theo policy an toàn
      return res.status(400).json({
        success: false,
        message:
          'Tin đã hết hạn hiển thị. Vui lòng đăng/gia hạn để hiển thị lại.',
        expired: true,
      });
    }

    // 4) Nếu chưa hết hạn và đang paused => resume
    job.publishStatus = 'approved';
    job.visibility = 'visible';
    // (tùy muốn bạn có thể lưu resumeAt hoặc increment một counter)
    job.lastResumedAt = now; // optional (thêm field nếu cần)
    await job.save();

    const remainingMs = expiredAt - now;
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    return res.json({
      success: true,
      message: 'Tin đã được hiển thị lại',
      job,
      remainingDays,
    });
  } catch (err) {
    console.error('resumeJob error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
