import JobsGroup from '../models/jobsGroup.model.js';
import Location from '../models/location.model.js';
import Skill from '../models/skill.model.js';
import * as JobRepository from '../repositories/jobs.repository.js';

export const getAllJobGroups = async () => {
  return await JobsGroup.find({});
};

export const getJobsByGroup = async (groupName) => {
  return await JobsGroup.findOne({ group: groupName });
};

export const createJobService = async (form) => {
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
    description: form.jobDescription,
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
    deadline: form.applicationDeadline,
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
    receiverAddress: form.receiverAddress,
    allowOnlineApply: form.allowOnlineApply,
    employer_id: null,
    group_id: null,
  };
  return JobRepository.createJob(jobData);
};
