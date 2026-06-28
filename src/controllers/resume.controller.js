import { Readable } from 'node:stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
    await deleteResumeService(req.user.userId, req.params.id);

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
    await setDefaultResumeService(req.user.userId, req.params.id);

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

    if (!resume.fileUrl) {
      throw new Error('Không tìm thấy URL file CV');
    }

    const isLocalPath =
      /^\//.test(resume.fileUrl) || !/^https?:\/\//i.test(resume.fileUrl);
    let contentType = 'application/pdf';
    let stream;
    let localPath;

    if (isLocalPath) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      localPath = path.join(
        __dirname,
        '../../',
        resume.fileUrl.replace(/^\//, ''),
      );

      if (!fs.existsSync(localPath)) {
        throw new Error('File CV không tồn tại trên server');
      }

      const ext = path.extname(localPath).toLowerCase();
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.docx')
        contentType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.doc') contentType = 'application/msword';
      else contentType = 'application/octet-stream';

      stream = fs.createReadStream(localPath);
    } else {
      const remoteFile = await fetch(resume.fileUrl);
      if (!remoteFile.ok) {
        throw new Error('Không tải được file CV từ Cloudinary');
      }

      // Force PDF if the stored file name or type indicates PDF.
      const isPdf =
        /\.pdf$/i.test(resume.fileName) || resume.fileType === 'pdf';
      contentType = isPdf
        ? 'application/pdf'
        : remoteFile.headers.get('content-type') || 'application/octet-stream';
      stream = Readable.from(remoteFile.body);
    }

    res.setHeader('Content-Type', contentType);
    // Explicit inline disposition with filename so browsers show PDF inline instead of downloading
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${resume.fileName || 'resume'}"`,
    );
    // Set content-length when available to help browser rendering
    if (isLocalPath) {
      try {
        const stat = fs.statSync(localPath);
        if (stat && stat.size)
          res.setHeader('Content-Length', String(stat.size));
      } catch {
        // ignore
      }
    } else {
      try {
        const remoteLen = (
          await fetch(resume.fileUrl, { method: 'HEAD' })
        ).headers.get('content-length');
        if (remoteLen) res.setHeader('Content-Length', remoteLen);
      } catch {
        // ignore HEAD failure
      }
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return stream.pipe(res);
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
      remoteFile.headers.get('content-type') || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resume.fileName}"`,
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
