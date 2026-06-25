import { Readable } from 'node:stream';
import {
  uploadResumeService,
  getResumesService,
  deleteResumeService,
  setDefaultResumeService,
  getResumeFileService,
  recommendResumeService,
} from '../services/resume/resume.service.js';

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
    const { resume } = await getResumeFileService(req.params.id);
    const ext = resume.fileName.split('.').pop().toLowerCase();

    if (!resume.fileUrl) {
      throw new Error('Không tìm thấy URL file CV');
    }

    if (ext === 'pdf') {
      const remoteFile = await fetch(resume.fileUrl);
      if (!remoteFile.ok) {
        throw new Error('Không tải được file CV từ Cloudinary');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return Readable.from(remoteFile.body).pipe(res);
    }

    return res.redirect(resume.fileUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || 'View resume failed',
    });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { resume } = await getResumeFileService(req.params.id);
    if (!resume.fileUrl) {
      throw new Error('Không tìm thấy URL file CV');
    }

    const remoteFile = await fetch(resume.fileUrl);
    if (!remoteFile.ok) {
      throw new Error('Không tải được file CV từ Cloudinary');
    }

    res.setHeader(
      'Content-Type',
      remoteFile.headers.get('content-type') || 'application/octet-stream'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resume.fileName}"`
    );

    return Readable.from(remoteFile.body).pipe(res);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Download failed',
    });
  }
};

export const recommendResume = async (req, res) => {
  try {
    const data = await recommendResumeService(req.params.id);

    return res.status(200).json(data);
  } catch (err) {
    console.error('recommendResume error:', err);

    return res.status(500).json({
      message: err.message || 'Recommend CV thất bại',
    });
  }
};
