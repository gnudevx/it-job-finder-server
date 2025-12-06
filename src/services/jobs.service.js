import JobsGroup from '../models/jobsGroup.model.js';
import Location from '../models/location.model.js';
import Skill from '../models/skill.model.js';
import Jobs from '../models/jobs.model.js';
import * as JobRepository from '../repositories/jobs.repository.js';

export const getAllJobGroups = async () => {
  return await JobsGroup.find({});
};

export const getJobsByGroup = async (groupName) => {
  return await JobsGroup.findOne({ group: groupName });
};

export const createJobService = async (form, employerId) => {
  // 1. Lấy ObjectId của location
  const location = await Location.findOne({ code: form.ward });
  if (!location) throw new Error('Invalid ward code');

  // 2. Lấy skills ObjectId
  const skillNames = [
    ...(form.domainKnowledge || []),
    ...(form.languages || []),
    ...(form.mustHaveSkills || []),
    ...(form.optionalSkills || []),
  ];

  const skills = await Skill.find({ name: { $in: skillNames } }).select('_id');

  // 3. Mapping tất cả dữ liệu FE → DB
  const jobData = {
    title: form.title,
    jobDescription: form.jobDescription,
    requirements: form.requirements?.split('\n') || [],
    benefits: form.benefits?.split('\n') || [],
    experience: form.experience,
    experienceLevel: form.experienceLevel, // thêm
    specialization: form.specialization, // nếu cần
    level: form.level, // nếu cần
    jobType: form.jobType,
    work_location_detail: form.address,
    working_time: {
      dayFrom: form.workingTime?.dayFrom || '',
      dayTo: form.workingTime?.dayTo || '',
      timeFrom: form.workingTime?.timeFrom || '',
      timeTo: form.workingTime?.timeTo || '',
    },
    jobType: form.jobType,
    applicationDeadline: form.applicationDeadline,
    quantity: form.quantity,

    province: form.province,
    district: form.district,
    salaryFrom: form.salaryFrom,
    salaryTo: form.salaryTo,
    salary_raw: form.salaryNegotiable
      ? 'Thỏa thuận'
      : `${form.salaryFrom}-${form.salaryTo}`,
    currency_unit: form.salaryCurrency || 'VND',
    location: location._id,
    skills: skills.map((s) => s._id),
    ageRange: form.ageRange,
    education: form.education,
    gender: form.gender,
    mustHaveSkills: form.mustHaveSkills || [],
    optionalSkills: form.optionalSkills || [],
    domainKnowledge: form.domainKnowledge || [],
    languages: form.languages || [],
    portfolioRequired: form.portfolioRequired,
    receiverName: form.receiverName,
    receiverEmail: form.receiverEmail,
    receiverPhone: form.receiverPhone,
    allowOnlineApply: form.allowOnlineApply,
    publishStatus: form.publishStatus,
    visibility: form.visibility,
    group_id: null,
    employer_id: employerId,
  };
  return JobRepository.createJob(jobData);
};

export const getAllJobsService = async () => {
  // Lấy tất cả job, populate thông tin employer
  const jobs = await Jobs.find({ publishStatus: { $ne: 'draft' } })
    .populate({
      path: 'employer_id',
      select: 'fullName companyId',
      populate: {
        path: 'companyId',
        select: 'name', // Lấy tên công ty
      },
    })
    .lean();
  return jobs;
};

export const getJobDetailService = async (jobId) => {
  const job = await Jobs.findById(jobId)
    .populate({
      path: 'employer_id',
      select: 'fullName companyId',
      populate: {
        path: 'companyId',
        select: 'name', // lấy tên công ty
      },
    })
    .populate('location', 'name code')
    .lean();

  if (!job) throw new Error('Job không tồn tại');
  return job;
};

// Cập nhật trạng thái job (approve / reject / revoke)
export const updateJobStatusService = async (jobId, newStatus) => {
  if (!['pending', 'approved', 'rejected', 'draft'].includes(newStatus)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  const updateData = { publishStatus: newStatus };

  // Nếu pending, đổi visibility thành visible
  if (newStatus === 'approved') {
    updateData.visibility = 'visible';
  }

  const job = await Jobs.findByIdAndUpdate(jobId, updateData, { new: true })
    .populate({
      path: 'employer_id',
      select: 'fullName email companyId',
      populate: {
        path: 'companyId',
        select: 'name',
      },
    })
    .lean();

  if (!job) throw new Error('Job không tồn tại');
  return job;
};
