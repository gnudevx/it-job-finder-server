// services/applyJob.service.js
import Application from '../models/applications.model.js';
import Jobs from '../models/jobs.model.js';
import Resume from '../models/resumes.model.js';

export const applyToJob = async ({
  candidateId,
  jobId,
  resumeId,
  coverLetter,
}) => {
  // 1. Kiểm tra job có tồn tại không
  const job = await Jobs.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // 2. Kiểm tra resume có thuộc về candidate hay không
  const resume = await Resume.findOne({ _id: resumeId, candidateId });
  if (!resume) {
    throw new Error('Resume not valid for this candidate');
  }

  // 3. Kiểm tra ứng viên đã từng apply job này chưa
  const existed = await Application.findOne({ candidateId, jobId });
  if (existed) {
    throw new Error('You have already applied for this job');
  }

  // 4. Tạo Application mới
  const application = await Application.create({
    candidateId,
    jobId,
    resumeId,
    coverLetter: coverLetter || '',
    status: 'applied',
    appliedAt: new Date(),
    updatedAt: new Date(),
  });

  return application;
};

// export const getAppliedJobsByCandidate = async (candidateId) => {
//   return Application.find({ candidateId })
//     .populate('jobId') // Lấy thông tin Job
//     .populate('resumeId'); // Lấy thông tin Resume nếu cần
// };
