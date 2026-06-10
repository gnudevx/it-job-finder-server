import Job from '../models/jobs.model.js';
import * as jobService from '../services/jobs.service.js';
import Employer from '../models/employer.model.js';
import Location from '../models/location.model.js';
import Skill from '../models/skill.model.js';
import { getJobLimitStatus } from '../services/jobLimitService.service.js';

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lấy toàn bộ job (dạng phẳng)
export const getJobs = async (req, res) => {
  try {
    const {
      q = '',
      location = '',
      experience = '',
      salaryLevel = '',
      skills = '',
      createDate = '',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { visibility: 'visible' };
    const andConditions = []; // For combining multiple $or clauses

    if (location) {
      const locationDocs = await Location.find({
        name: { $regex: new RegExp(escapeRegExp(location), 'i') },
      }).select('_id');

      if (!locationDocs.length) {
        return res.status(200).json({ success: true, data: [], totalPages: 0 });
      }

      filter.location = { $in: locationDocs.map((l) => l._id) };
    }

    if (skills) {
      const skillArr = String(skills)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Fetch matching skill docs so we can match by ObjectId when available
      const skillDocs = await Skill.find({
        name: {
          $in: skillArr.map((s) => new RegExp(`^${escapeRegExp(s)}$`, 'i')),
        },
      }).select('name _id');

      // For each requested skill, require it to match at least one field (skills id, mustHaveSkills, optionalSkills)
      const perSkillAndConditions = [];

      skillArr.forEach((skill) => {
        const pattern = new RegExp(`^${escapeRegExp(skill)}$`, 'i');
        const skillOr = [];

        // If we found a Skill doc for this name, match by its ObjectId in the skills array
        const matchedDoc = skillDocs.find((d) => pattern.test(d.name));
        if (matchedDoc) {
          skillOr.push({ skills: { $in: [matchedDoc._id] } });
        }

        // Also allow matching when stored as plain strings in mustHaveSkills/optionalSkills
        skillOr.push({ mustHaveSkills: pattern });
        skillOr.push({ optionalSkills: pattern });

        // Add an $or for this specific skill; later we'll require all of these ($and semantics)
        perSkillAndConditions.push({ $or: skillOr });
      });

      // Add all per-skill $or clauses as $and conditions so jobs must match every selected skill
      andConditions.push(...perSkillAndConditions);
    }

    if (experience) {
      // Handle both numeric and text-based experience filters
      // Support formats like "1", "2", "3", "4-5", "Trên 5", "Chưa có"
      const expFilter = new RegExp(escapeRegExp(String(experience)), 'i');
      filter.experience = expFilter;
    }

    if (createDate) {
      const days = Number(createDate);
      if (!isNaN(days)) {
        filter.createdAt = {
          $gte: new Date(Date.now() - days * 86400000),
        };
      }
    }

    if (q) {
      const keyword = new RegExp(escapeRegExp(q), 'i');
      andConditions.push({
        $or: [
          { title: keyword },
          { jobDescription: keyword },
          { specialization: keyword },
        ],
      });
    }

    // If we have multiple $or conditions, use $and to combine them
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const skip = (page - 1) * limit;

    let [jobs, total] = await Promise.all([
      Job.find(filter)
        .select(
          'title salary_raw salary_normalized salaryFrom salaryTo location skills group_id employer_id createdAt',
        )
        .populate('location')
        .populate('group_id')
        .populate({
          path: 'employer_id',
          select: 'avatar companyId',
          populate: {
            path: 'companyId',
            select: 'name logo',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Job.countDocuments(filter),
    ]);

    if (salaryLevel) {
      const threshold = Number(salaryLevel);
      if (!Number.isNaN(threshold)) {
        jobs = jobs.filter((job) => {
          let jobSalary = 0;

          // Priority 1: Use salary_normalized if available
          if (job.salary_normalized && job.salary_normalized > 0) {
            jobSalary = Number(job.salary_normalized);
          }
          // Priority 2: Extract from salaryFrom (for documents with range)
          else if (job.salaryFrom && Number(job.salaryFrom) > 0) {
            jobSalary = Number(job.salaryFrom);
          }
          // Priority 3: Parse salary_raw string
          else if (job.salary_raw) {
            // Extract all numbers from salary_raw and take the maximum
            const numbers = (job.salary_raw || '')
              .split(/[-–—,/]/) // Split by common separators
              .map((n) => parseInt(n.replace(/\D/g, ''), 10))
              .filter((n) => !Number.isNaN(n) && n > 0);

            if (numbers.length > 0) {
              jobSalary = Math.max(...numbers);
            }
          }

          return jobSalary > 0 && jobSalary >= threshold;
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: jobs,
      total,
      totalPages: Math.ceil(total / limit),
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
    const employerUserId = req.user.userId; // user id từ token
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
