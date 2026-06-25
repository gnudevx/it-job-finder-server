import Resume from '../../models/resumes.model.js';
import candidateService from '../candidate.service.js';
import cloudinary from '../../config/cloudinary.js';
import { parseAndSaveResume } from '../parseResume.service.js';
import { recommendJobsForResume } from './recommendResume.service.js';
import cloudinary from '../../config/cloudinary.js';
export const uploadResumeService = async (userId, file) => {
  const candidate = await candidateService.getMyInfo(userId);

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  if (!file) {
    throw new Error('File is required');
  }

  let fileType = 'pdf';

  if (
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    fileType = 'docx';
  } else if (file.mimetype === 'application/msword') {
    fileType = 'doc';
  }

  const newResume = await Resume.create({
    candidateId: candidate._id,
    fileUrl: file.path,
    fileName: file.originalname,
    fileType,
    size: file.size,
    isDefault: false,
  });

  parseAndSaveResume(newResume._id)
    .then(() => console.log('Resume parsed successfully:', newResume._id))
    .catch((err) => console.error('Resume parse failed:', err));

  return newResume;
};

export const getResumesService = async (userId) => {
  const candidate = await candidateService.getMyInfo(userId);

  return Resume.find({
    candidateId: candidate._id,
  }).sort({ createdAt: -1 });
};

export const deleteResumeService = async (id) => {
  const resume = await Resume.findById(id);

  if (!resume) {
    throw new Error('CV không tồn tại');
  }

  const publicId = resume.fileUrl
    .split('/')
    .slice(-2) // lấy folder/filename
    .join('/')
    .replace(/\.[^/.]+$/, ''); // bỏ extension

  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  return true;
};

export const setDefaultResumeService = async (candidateId, id) => {
  await Resume.updateMany({ candidateId }, { isDefault: false });

  await Resume.findByIdAndUpdate(id, {
    isDefault: true,
  });
};

export const getResumeFileService = async (id) => {
  const resume = await Resume.findById(id);
  if (!resume) throw new Error('Resume not found');

  return { resume, fileUrl: resume.fileUrl };
};

export const recommendResumeService = async (resumeId) => {
  if (process.env.CV_RECOMMEND_URL) {
    const resume = await Resume.findById(resumeId);
    if (!resume) throw new Error('CV không tồn tại');

    // Fetch file từ Cloudinary URL thay vì đọc local
    const fileResponse = await fetch(resume.fileUrl);
    if (!fileResponse.ok) throw new Error('Không tải được file từ Cloudinary');

    const fileBuffer = await fileResponse.arrayBuffer();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', blob, resume.fileName);

    const response = await fetch(process.env.CV_RECOMMEND_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Recommend service returned error:', response.status, text);
      throw new Error('Dịch vụ gợi ý CV lỗi');
    }

    return response.json();
  }

  return recommendJobsForResume(resumeId);
};
