import Job from '../models/jobs.model.js';
import Application from '../models/applications.model.js';
import ParsedResume from '../models/ParsedResumeSchema.module.js';
import { findEmployer } from '../services/employer.service.js';
export const employerSearchCV = async (req, res) => {
  try {
    const userId = req.user.userId;

    const employer = await findEmployer(userId);
    const employerId = employer._id; // lấy từ JWT
    const {
      q = '',
      skills = '',
      jobTitle = '',
      level = '',
      location = '',
      education = '',
      status = '',
      experienceMin,
      experienceMax,
      salaryFrom,
      salaryTo,
    } = req.query;

    // Lấy job của employer
    const jobs = await Job.find({ employer_id: employerId })
      .select('_id')
      .lean();

    const jobIds = jobs.map((j) => j._id);
    if (!jobIds.length) return res.json([]);

    // Lấy application thuộc các job đó
    const applicationFilter = { jobId: { $in: jobIds } };
    if (status) {
      const statuses = status
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (statuses.length > 0) {
        applicationFilter.status = { $in: statuses };
      }
    }

    const applications = await Application.find(applicationFilter)
      .populate('resumeId')
      .populate({
        path: 'candidateId',
        select: 'fullName avatar address',
      })
      .populate({
        path: 'jobId',
        select:
          'title level salaryFrom salaryTo salary_raw education work_location_detail requirements mustHaveSkills optionalSkills domainKnowledge languages publishStatus visibility',
        populate: [{ path: 'location', select: 'name' }],
      })
      .lean();

    if (!applications.length) return res.json([]);

    // Lấy resumeId
    const applicationsWithResume = applications.filter(
      (a) => a.resumeId && a.resumeId._id,
    );
    const resumeIds = applicationsWithResume.map((a) => a.resumeId._id);

    const parsedResumes = await ParsedResume.find({
      resumeId: { $in: resumeIds },
    }).lean();

    const parsedMap = new Map(
      parsedResumes.map((parsed) => [parsed.resumeId.toString(), parsed]),
    );

    const normalize = (value) =>
      String(value || '')
        .trim()
        .toLowerCase();
    const parseNumber = (value) => {
      if (!value) return null;
      const number = String(value)
        .replace(/[^0-9.,]/g, '')
        .replace(',', '.');
      return Number(number) || null;
    };
    const parseSalary = (value) => {
      const parsedValue = parseNumber(value);
      return parsedValue && parsedValue > 0 ? parsedValue : null;
    };

    const requestSkills = skills
      .split(',')
      .map((item) => normalize(item))
      .filter(Boolean);
    const skillSet = new Set(requestSkills);
    const keyword = normalize(q);
    const jobTitleFilter = normalize(jobTitle);
    const levelFilter = normalize(level);
    const locationFilter = normalize(location);
    const educationFilter = normalize(education);
    const experienceMinNumber = parseNumber(experienceMin);
    const experienceMaxNumber = parseNumber(experienceMax);
    const salaryFromNumber = parseSalary(salaryFrom);
    const salaryToNumber = parseSalary(salaryTo);

    const matchesQuery = (item, search) => normalize(item).includes(search);

    const filteredApplications = applicationsWithResume.filter((app) => {
      const job = app.jobId || {};
      const parsed = parsedMap.get(app.resumeId._id.toString());

      const rawText = normalize(parsed?.rawText || '');
      const combinedSkills = [
        ...(parsed?.skills || []),
        ...(job.mustHaveSkills || []),
        ...(job.optionalSkills || []),
        ...(job.domainKnowledge || []),
        ...(job.languages || []),
      ]
        .map((s) => normalize(s))
        .filter(Boolean);
      const combinedSkillSet = new Set(combinedSkills);

      if (skillSet.size > 0) {
        const missingSkill = [...skillSet].some(
          (skill) => !combinedSkillSet.has(skill),
        );
        if (missingSkill) return false;
      }

      if (jobTitleFilter) {
        const titleText = normalize(job.title || '');
        if (!titleText.includes(jobTitleFilter)) return false;
      }

      if (levelFilter) {
        const levelText = normalize(job.level || '');
        const roleText = normalize(parsed?.detectedRole || '');
        if (!levelText.includes(levelFilter) && !roleText.includes(levelFilter))
          return false;
      }

      if (locationFilter) {
        const locationText = normalize(job.location?.name || '');
        const locationDetail = normalize(job.work_location_detail || '');
        const candidateAddress = normalize(app.candidateId?.address || '');
        if (
          !locationText.includes(locationFilter) &&
          !locationDetail.includes(locationFilter) &&
          !candidateAddress.includes(locationFilter)
        ) {
          return false;
        }
      }

      if (educationFilter) {
        const jobEducation = normalize(job.education || '');
        const resumeEducation = normalize(parsed?.rawText || '');
        if (
          !jobEducation.includes(educationFilter) &&
          !resumeEducation.includes(educationFilter)
        ) {
          return false;
        }
      }

      if (experienceMinNumber != null) {
        const experienceValue = parsed?.totalYearsExperience || 0;
        if (experienceValue < experienceMinNumber) return false;
      }
      if (experienceMaxNumber != null) {
        const experienceValue = parsed?.totalYearsExperience || 0;
        if (experienceValue > experienceMaxNumber) return false;
      }

      if (salaryFromNumber != null || salaryToNumber != null) {
        const jobFrom = parseSalary(job.salaryFrom || job.salary_raw);
        const jobTo = parseSalary(job.salaryTo || job.salary_raw);
        if (
          salaryFromNumber != null &&
          jobTo != null &&
          jobTo < salaryFromNumber
        )
          return false;
        if (
          salaryToNumber != null &&
          jobFrom != null &&
          jobFrom > salaryToNumber
        )
          return false;
      }

      if (keyword) {
        const fields = [
          app.candidateId?.fullName,
          parsed?.detectedRole,
          parsed?.summary,
          parsed?.shortSummary,
          rawText,
          (parsed?.skills || []).join(' '),
          app.note,
          job.title,
          job.level,
          job.education,
          job.location?.name,
          job.work_location_detail,
          (job.mustHaveSkills || []).join(' '),
          (job.optionalSkills || []).join(' '),
          (job.domainKnowledge || []).join(' '),
          (job.languages || []).join(' '),
        ];

        const found = fields.some((field) => matchesQuery(field, keyword));
        if (!found) return false;
      }

      return true;
    });

    const result = filteredApplications.map((app) => {
      const job = app.jobId || {};
      const parsed = parsedMap.get(app.resumeId._id.toString());

      return {
        id: app._id,
        applicationId: app._id,
        resumeId: app.resumeId._id,
        jobId: job._id,
        jobTitle: job.title || '',
        jobLevel: job.level || '',
        jobLocation: job.location?.name || job.work_location_detail || '',
        salary: job.salary_raw || '',
        status: app.status,
        fullName: app.candidateId?.fullName || '',
        avatar: app.candidateId?.avatar || '',
        address: app.candidateId?.address || '',
        title: parsed?.detectedRole || '',
        experienceYears: parsed?.totalYearsExperience || 0,
        summary: parsed?.summary || parsed?.shortSummary || '',
        skills: parsed?.skills || [],
        education: job.education || '',
        fileUrl: app.resumeId.fileUrl,
        fileType: app.resumeId.fileType,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Employer search CV failed' });
  }
};
