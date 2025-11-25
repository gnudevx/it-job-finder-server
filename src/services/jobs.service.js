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
    ...(form.languages?.map((l) => l.value) || []),
    ...(form.softSkills || []),
    ...(form.mustHaveSkills?.map((s) => s.value) || []),
    ...(form.optionalSkills?.map((s) => s.value) || []),
  ];

  const skills = await Skill.find({ name: { $in: skillNames } }).select('_id');

  // 3. Mapping tất cả dữ liệu FE → DB
  const jobData = {
    title: form.title,
    description: form.jobDescription,
    requirements: form.requirements?.split('\n') || [],
    benefits: form.benefits?.split('\n') || [],
    experience: form.experience,
    work_location_detail: form.address,
    working_time: form.workingTime,
    deadline: form.applicationDeadline,
    salary_raw: form.salaryNegotiable
      ? 'Thoả thuận'
      : `${form.salaryFrom}-${form.salaryTo}`,
    salary_normalized: Number(form.salaryFrom) || 0,
    currency_unit: 'VND',
    location: location._id,
    skills: skills.map((s) => s._id),
    ageRange: form.ageRange,
    education: form.education,
    gender: form.gender,
    mustHaveSkills: form.mustHaveSkills?.map((s) => s.value) || [],
    optionalSkills: form.optionalSkills?.map((s) => s.value) || [],
    domainKnowledge: form.domainKnowledge || [],
    languages: form.languages?.map((l) => l.value) || [],
    softSkills: form.softSkills || [],
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
