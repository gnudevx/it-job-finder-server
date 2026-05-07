import Job from '../../models/jobs.model.js';
import ParsedResume from '../../models/ParsedResumeSchema.module.js';
import { parseAndSaveResume } from '../parseResume.service.js';

const normalizeString = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const uniqueNormalized = (values = []) => [
  ...new Set(values.map((value) => normalizeString(value)).filter(Boolean)),
];

const extractNumbers = (text) => {
  if (!text) return [];
  return Array.from(String(text).matchAll(/\d+(?:[\.,]\d+)?/g)).map((match) =>
    Number(match[0].replace(',', '.')),
  );
};

const parseExperienceNumber = (experienceText) => {
  const numbers = extractNumbers(experienceText);
  return numbers.length > 0 ? numbers[0] : null;
};

const parseSalaryNumber = (salaryText) => {
  const numbers = extractNumbers(salaryText);
  return numbers.length > 0 ? Math.max(...numbers) : null;
};

const containsPhrase = (text, phrase) => {
  if (!text || !phrase) return false;
  return normalizeString(text).includes(normalizeString(phrase));
};

const buildReason = ({
  requiredMatches,
  optionalMatches,
  descriptionMatches,
  roleMatchScore,
  expMatchScore,
  textBucketMatch,
  salaryMatchScore,
}) => {
  const parts = [];
  if (requiredMatches.length > 0) {
    parts.push(`Có ${requiredMatches.length} kỹ năng bắt buộc trùng khớp`);
  }
  if (optionalMatches.length > 0) {
    parts.push(`Có ${optionalMatches.length} kỹ năng phụ phù hợp`);
  }
  if (descriptionMatches > 0) {
    parts.push(
      `Nội dung CV khớp ${descriptionMatches} điểm chính của mô tả công việc`,
    );
  }
  if (roleMatchScore) {
    parts.push('Vị trí ứng tuyển phù hợp với vai trò CV');
  }
  if (textBucketMatch) {
    parts.push('Nội dung CV trùng khớp với mô tả công việc');
  }
  if (salaryMatchScore) {
    parts.push('CV có đề cập mức lương phù hợp với yêu cầu');
  }
  if (expMatchScore) {
    parts.push('Kinh nghiệm phù hợp với yêu cầu công việc');
  }
  return parts.length > 0
    ? parts.join('. ') + '.'
    : 'CV có những điểm phù hợp với tuyển dụng.';
};

export const recommendJobsForResume = async (resumeId) => {
  await parseAndSaveResume(resumeId);

  const parsedResume = await ParsedResume.findOne({ resumeId }).lean();
  if (!parsedResume) {
    throw new Error('Resume chưa được phân tích hoặc không tồn tại');
  }

  const resumeSkills = uniqueNormalized(parsedResume.skills);
  const resumeSkillSet = new Set(resumeSkills);
  const resumeText = normalizeString(parsedResume.rawText || '');
  const resumeRole = normalizeString(parsedResume.detectedRole || '');
  const preferredSummary =
    parsedResume.summary || parsedResume.shortSummary || '';

  const jobs = await Job.find({
    publishStatus: 'approved',
    visibility: 'visible',
  })
    .populate('skills', 'name')
    .lean();

  const scoredJobs = jobs
    .map((job) => {
      const jobTitle = normalizeString(job.title || '');
      const jobDescription = normalizeString(job.jobDescription || '');
      const jobRequirements = uniqueNormalized(job.requirements || []);
      const jobSkills = uniqueNormalized(
        (job.skills || [])
          .map((skill) => (typeof skill === 'object' ? skill.name : skill))
          .filter(Boolean),
      );
      const requiredSkills = uniqueNormalized([
        ...(jobSkills || []),
        ...(job.mustHaveSkills || []),
      ]);
      const optionalSkills = uniqueNormalized([
        ...(job.optionalSkills || []),
        ...(job.domainKnowledge || []),
        ...(job.languages || []),
        ...jobRequirements,
      ]);
      const textBucket = normalizeString(
        [
          job.title,
          job.jobDescription,
          jobRequirements.join(' '),
          job.level,
          job.education,
        ]
          .filter(Boolean)
          .join(' '),
      );
      const jobSalaryFrom = parseSalaryNumber(job.salaryFrom);
      const jobSalaryTo = parseSalaryNumber(job.salaryTo);
      const jobSalaryRaw = parseSalaryNumber(job.salary_raw);
      const jobSalaryNumber = jobSalaryTo || jobSalaryFrom || jobSalaryRaw;
      const salaryMatchScore =
        jobSalaryNumber && containsPhrase(resumeText, String(jobSalaryNumber))
          ? 1
          : 0;
      const requiredMatches = requiredSkills.filter((skill) =>
        resumeSkillSet.has(skill),
      );
      const optionalMatches = optionalSkills.filter((skill) =>
        resumeSkillSet.has(skill),
      );

      const descriptionMatches = uniqueNormalized([
        ...requiredSkills,
        ...optionalSkills,
        ...(jobRequirements || []),
        jobTitle,
        jobDescription,
      ]).filter(
        (keyword) => keyword.length > 2 && containsPhrase(resumeText, keyword),
      ).length;
      const textBucketMatch = textBucket
        ? containsPhrase(resumeText, textBucket)
        : 0;

      const roleMatchScore =
        resumeRole &&
        (jobTitle.includes(resumeRole) || resumeText.includes(resumeRole))
          ? 1
          : 0;
      const expectedExp = parseExperienceNumber(job.experience);
      const expMatchScore =
        expectedExp && parsedResume.totalYearsExperience >= expectedExp ? 1 : 0;

      let score = 0;
      let maxScore = 0;

      if (requiredSkills.length > 0) {
        maxScore += 40;
        score +=
          Math.min(requiredMatches.length / requiredSkills.length, 1) * 40;
      }
      if (optionalSkills.length > 0) {
        maxScore += 25;
        score +=
          Math.min(optionalMatches.length / optionalSkills.length, 1) * 25;
      }
      if (descriptionMatches > 0) {
        maxScore += 20;
        score += Math.min(descriptionMatches, 5) * 4;
      }
      if (textBucketMatch) {
        maxScore += 5;
        score += 5;
      }
      if (salaryMatchScore) {
        maxScore += 5;
        score += 5;
      }
      if (roleMatchScore) {
        maxScore += 10;
        score += 10;
      }
      if (expMatchScore) {
        maxScore += 5;
        score += 5;
      }

      if (maxScore === 0) {
        // Fallback when job has no explicit skills / requirements
        const fallbackMatches = uniqueNormalized([
          ...jobSkills,
          ...requiredSkills,
          ...optionalSkills,
          ...(jobRequirements || []),
          jobTitle,
        ]).filter(
          (keyword) => keyword.length > 2 && resumeText.includes(keyword),
        );
        score = Math.min(
          100,
          fallbackMatches.length * 10 + roleMatchScore * 10,
        );
      }

      const matchPercentage = Math.round(
        Math.min(100, maxScore > 0 ? (score / maxScore) * 100 : score),
      );
      return {
        id: job._id,
        match_percentage: matchPercentage,
        reason: buildReason({
          requiredMatches,
          optionalMatches,
          descriptionMatches,
          roleMatchScore,
          expMatchScore,
          textBucketMatch,
          salaryMatchScore,
        }),
        matched_skills: {
          required: requiredMatches,
          optional: optionalMatches,
        },
      };
    })
    .filter((job) => job.match_percentage > 0)
    .sort((a, b) => b.match_percentage - a.match_percentage)
    .slice(0, 20);

  return {
    skills_found: resumeSkills,
    summary: preferredSummary,
    recommendations: scoredJobs,
  };
};
