import fs from 'fs';
import {
  uploadResumeService,
  getResumesService,
  deleteResumeService,
  setDefaultResumeService,
  getResumeFileService,
} from '../services/resume/resume.service.js';

import { recommendJobsForResume } from '../services/resume/recommendResume.service.js';

export const uploadResume = async (req, res) => {
  try {
    const resume = await uploadResumeService(req.user.userId, req.file);

    return res.status(200).json({
      message: 'Upload CV thành công',
      resume,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message || 'Server error',
    });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await getResumesService(req.user.userId);

    return res.status(200).json(resumes);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    await deleteResumeService(req.params.id);

    return res.status(200).json({
      message: 'Xoá CV thành công',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message || 'Server error',
    });
  }
};

export const setDefaultResume = async (req, res) => {
  try {
    await setDefaultResumeService(req.user.id, req.params.id);

    return res.status(200).json({
      message: 'Đã đặt CV mặc định',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

export const viewResume = async (req, res) => {
  try {
    const { resume, filePath } = await getResumeFileService(req.params.id);

    const ext = resume.fileName.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');

      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    }

    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    return res.status(500).json({
      message: err.message || 'View resume failed',
    });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { resume, filePath } = await getResumeFileService(req.params.id);

    return res.download(filePath, resume.fileName);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Download failed',
    });
  }
};

export const recommendResume = async (req, res) => {
  try {
    const data = await recommendJobsForResume(req.params.id);

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Recommend CV thất bại',
    });
  }
};
