import Resume from '../../models/resumes.model.js';
import candidateService from '../candidate.service.js';
import fs from 'fs';
import path from 'path';
import { parseAndSaveResume } from '../parseResume.service.js';
import { recommendJobsForResume } from './recommendResume.service.js';

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
    fileUrl: `/uploads/resumes/${file.filename}`,
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

  const filePath = '.' + resume.fileUrl;

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await resume.deleteOne();

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

  if (!resume) {
    throw new Error('Resume not found');
  }

  const filePath = path.join(process.cwd(), resume.fileUrl.replace(/^\//, ''));

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  return {
    resume,
    filePath,
  };
};

export const recommendResumeService = async (resumeId) => {
  const recommend_url = process.env.CV_RECOMMEND_URL + '/recommend';
  if (recommend_url) {
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      throw new Error('CV không tồn tại');
    }

    const relativePath = resume.fileUrl.startsWith('/')
      ? resume.fileUrl.slice(1)
      : resume.fileUrl;

    const filePath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      throw new Error('File không tồn tại');
    }

    const fileBuffer = await fs.promises.readFile(filePath);

    const blob = new Blob([fileBuffer], {
      type: 'application/pdf',
    });

    const formData = new FormData();

    formData.append('file', blob, resume.fileName);

    const response = await fetch(recommend_url, {
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
