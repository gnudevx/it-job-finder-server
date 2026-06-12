import Jobs from '../models/jobs.model.js';
import Resume from '../models/resumes.model.js';
import ParsedResume from '../models/ParsedResumeSchema.module.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';

export const recommendJobsService = async (jobId) => {
  const currentJob = await Jobs.findById(jobId).lean();

  if (!currentJob) {
    throw new Error('Job not found');
  }

  if (!currentJob.embedding || currentJob.embedding.length === 0) {
    return [];
  }

  const jobs = await Jobs.find({
    _id: { $ne: jobId },
    publishStatus: 'approved',
    visibility: 'visible',
    embedding: { $exists: true, $ne: [] },
  })
    .select('title salary_raw location embedding')
    .populate('location', 'name')
    .populate({
      path: 'employer_id',
      select: 'companyId',
      populate: {
        path: 'companyId',
        select: 'name logo',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const scored = [];

  // Tính độ tương đồng giữa công việc hiện tại và các công việc khác
  for (const job of jobs) {
    if (!job.embedding) continue;

    if (job.embedding.length !== currentJob.embedding.length) continue;

    let sim = 0;

    try {
      sim = cosineSimilarity(currentJob.embedding, job.embedding);
    } catch (err) {
      console.error(`Error calculating similarity for job ${job._id}:`, err);
      continue;
    }

    // Chỉ thêm vào danh sách nếu độ tương đồng là một số hợp lệ
    if (!isNaN(sim)) {
      scored.push({
        _id: job._id,
        title: job.title,
        salary_raw: job.salary_raw,
        location: job.location?.name,
        companyName: job.employer_id?.companyId?.name || '',
        logo: job.employer_id?.companyId?.logo || '',
        similarity: sim,
      });
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, 5);
};

export const recommendCvsForJob = async (jobId, limit = 10) => {
  const job = await Jobs.findById(jobId).lean();

  if (!job) {
    throw new Error('Job not found');
  }

  if (!job.embedding || job.embedding.length === 0) {
    return [];
  }

  const resumes = await Resume.find({
    embedding: { $exists: true, $ne: [] },
  })
    .select('candidateId fileName fileType embedding')
    .populate('candidateId', 'fullName')
    .sort({ createdAt: -1 })
    .lean();

  if (!resumes.length) {
    return [];
  }

  const resumeIds = resumes.map((resume) => resume._id);
  const parsedResumes = await ParsedResume.find({
    resumeId: { $in: resumeIds },
  })
    .select('resumeId skills summary shortSummary')
    .lean();

  const parsedByResumeId = new Map(
    parsedResumes.map((parsed) => [parsed.resumeId.toString(), parsed]),
  );

  const recommendations = [];

  for (const resume of resumes) {
    if (!resume.embedding) continue;
    if (resume.embedding.length !== job.embedding.length) continue;

    const parsed = parsedByResumeId.get(resume._id.toString());
    if (!parsed) continue;

    let similarity;
    try {
      similarity = cosineSimilarity(job.embedding, resume.embedding);
    } catch (err) {
      console.error(
        `Error calculating similarity for resume ${resume._id}:`,
        err,
      );
      continue;
    }

    if (Number.isNaN(similarity)) continue;

    recommendations.push({
      resumeId: resume._id,
      candidateId:
        typeof resume.candidateId === 'object'
          ? resume.candidateId._id
          : resume.candidateId,
      candidateName: resume.candidateId?.fullName || '',
      jobTitle: job.title,
      fileName: resume.fileName,
      fileType: resume.fileType,
      skills: parsed.skills || [],
      summary: parsed.summary || parsed.shortSummary || '',
      matchScore: Number(similarity.toFixed(4)),
    });
  }

  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations.slice(0, limit);
};
