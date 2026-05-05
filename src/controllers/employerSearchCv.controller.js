import Job from '../models/jobs.model.js';
import Application from '../models/applications.model.js';
import ParsedResume from '../models/ParsedResumeSchema.module.js';
import { findEmployer } from '../services/employer.service.js';
export const employerSearchCV = async (req, res) => {
  try {
    const userId = req.user.userId;

    const employer = await findEmployer(userId);
    const employerId = employer._id; // lấy từ JWT
    const { q = '', skills = '' } = req.query;

    // Lấy job của employer
    const jobs = await Job.find({ employer_id: employerId })
      .select('_id')
      .lean();

    const jobIds = jobs.map((j) => j._id);
    console.log('JOBS:', jobs);
    if (!jobIds.length) return res.json([]);

    // Lấy application thuộc các job đó
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('resumeId')
      .populate({
        path: 'candidateId',
        select: 'fullName avatar address',
      })
      .lean();
    console.log('APPLICATIONS:', applications);
    if (!applications.length) return res.json([]);

    // Lấy resumeId
    const applicationsWithResume = applications.filter(
      (a) => a.resumeId && a.resumeId._id,
    );
    const resumeIds = applicationsWithResume.map((a) => a.resumeId._id);

    // Lấy parsed resume
    let parsedResumes = await ParsedResume.find({
      resumeId: { $in: resumeIds },
    }).lean();

    // FILTER theo skills
    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim().toLowerCase());
      parsedResumes = parsedResumes.filter((r) =>
        r.skills.some((s) => skillArr.includes(s.toLowerCase())),
      );
    }

    // MAP DATA CHO UI
    const result = parsedResumes
      .map((pr) => {
        const app = applicationsWithResume.find(
          (a) => a.resumeId._id.toString() === pr.resumeId.toString(),
        );

        if (!app) return null;

        return {
          id: pr._id,
          resumeId: pr.resumeId,
          fullName: app.candidateId.fullName,
          avatar: app.candidateId.avatar,
          address: app.candidateId.address,
          title: pr.detectedRole,
          experienceYears: pr.totalYearsExperience,
          summary: pr.summary || pr.shortSummary,
          skills: pr.skills,
          fileUrl: app.resumeId.fileUrl,
          fileType: app.resumeId.fileType,
        };
      })
      .filter(Boolean);

    // SEARCH TEXT
    const keyword = q.toLowerCase();
    const filtered = keyword
      ? result.filter(
          (cv) =>
            cv.fullName.toLowerCase().includes(keyword) ||
            cv.title.toLowerCase().includes(keyword) ||
            cv.skills.some((s) => s.toLowerCase().includes(keyword)),
        )
      : result;

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Employer search CV failed' });
  }
};
