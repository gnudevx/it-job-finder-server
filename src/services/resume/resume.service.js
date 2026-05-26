import Resume from '../../models/resumes.model.js';
import candidateService from '../candidate.service.js';
import fs from 'fs';
import path from 'path';
import { parseAndSaveResume } from '../parseResume.service.js';

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
