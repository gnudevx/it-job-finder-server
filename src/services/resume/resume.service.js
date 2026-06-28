import fs from 'fs';
import path from 'path';
import Resume from '../../models/resumes.model.js';
import ParsedResume from '../../models/ParsedResumeSchema.module.js';
import candidateService from '../candidate.service.js';
import cloudinary from '../../config/cloudinary.js';
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

  const fileUrl = file.path || file.secure_url || file.url;
  if (!fileUrl) {
    throw new Error('Upload failed, không lấy được URL file.');
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
    fileUrl,
    fileName: file.originalname,
    fileType,
    size: file.size,
    isDefault: false,
  });

  try {
    await parseAndSaveResume(newResume._id);
    console.log('Resume parsed successfully:', newResume._id);
  } catch (err) {
    console.error('Resume parse failed:', err);
  }

  return newResume;
};

export const getResumesService = async (userId) => {
  const candidate = await candidateService.getMyInfo(userId);

  return Resume.find({
    candidateId: candidate._id,
  }).sort({ createdAt: -1 });
};

export const deleteResumeService = async (userId, id) => {
  const candidate = await candidateService.getMyInfo(userId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const resume = await Resume.findOne({ _id: id, candidateId: candidate._id });

  if (!resume) {
    throw new Error('CV không tồn tại');
  }

  const publicId = resume.fileUrl?.includes('/upload/')
    ? resume.fileUrl
        .match(/\/upload\/(?:v\d+\/)?(.+)$/i)?.[1]
        ?.replace(/\.[^/.]+$/, '')
    : null;

  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (err) {
      console.warn('Failed to remove CV file from Cloudinary:', err.message);
    }
  }

  const localPath = resume.fileUrl?.startsWith('/')
    ? path.join(process.cwd(), resume.fileUrl.replace(/^\//, ''))
    : null;
  if (localPath && fs.existsSync(localPath)) {
    try {
      await fs.promises.unlink(localPath);
    } catch (err) {
      console.warn('Failed to remove local CV file:', err.message);
    }
  }

  await ParsedResume.deleteMany({ resumeId: resume._id });
  await Resume.deleteOne({ _id: resume._id });

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
  const recommend_url = process.env.CV_RECOMMEND_URL + '/recommend';
  if (recommend_url) {
    const resume = await Resume.findById(resumeId);
    if (!resume) throw new Error('CV không tồn tại');

    // Fetch file từ Cloudinary URL thay vì đọc local
    const fileResponse = await fetch(resume.fileUrl);
    if (!fileResponse.ok) throw new Error('Không tải được file từ Cloudinary');

    const fileBuffer = await fileResponse.arrayBuffer();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

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
