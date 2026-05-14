import Resume from '../models/resumes.model.js';
import candidateService from '../services/candidate.service.js';
import fs from 'fs';
import path from 'path';
import { parseAndSaveResume } from '../services/parseResume.service.js';
import { recommendJobsForResume } from '../services/resume/recommendResume.service.js';

export const uploadResume = async (req, res) => {
  try {
    const candidate = await candidateService.getMyInfo(req.user.userId);

    if (!candidate)
      return res.status(404).json({ message: 'Candidate not found' });

    const candidateId = candidate._id;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Detect file type from MIME type
    let fileType = 'pdf';
    if (
      req.file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileType = 'docx';
    } else if (req.file.mimetype === 'application/msword') {
      fileType = 'doc';
    }

    const newResume = await Resume.create({
      candidateId,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType,
      size: req.file.size,
      isDefault: false,
    });

    parseAndSaveResume(newResume._id)
      .then(() => console.log('Resume parsed successfully:', newResume._id))
      .catch((err) => console.error('Resume parse failed:', err));

    return res.status(200).json({
      message: 'Upload CV thành công',
      resume: newResume,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getResumes = async (req, res) => {
  try {
    const candidate = await candidateService.getMyInfo(req.user.userId);

    const candidateId = candidate._id;

    const resumes = await Resume.find({ candidateId }).sort({ createdAt: -1 });

    res.status(200).json(resumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const id = req.params.id;

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'CV không tồn tại' });

    // Xoá file vật lý
    fs.unlink('.' + resume.fileUrl, (err) => {
      if (err) console.log('Không thể xoá file:', err);
    });

    await resume.deleteOne();

    res.status(200).json({ message: 'Xoá CV thành công' });
  } catch (err) {
    console.error(err); // <--- thêm dòng này
    res.status(500).json({ message: 'Server error' });
  }
};

export const setDefaultResume = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const id = req.params.id;

    await Resume.updateMany({ candidateId }, { isDefault: false });

    await Resume.findByIdAndUpdate(id, { isDefault: true });

    res.status(200).json({ message: 'Đã đặt CV mặc định' });
  } catch (err) {
    console.error(err); // <--- thêm dòng này
    res.status(500).json({ message: 'Server error' });
  }
};
export const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const filePath = '.' + resume.fileUrl; // CỰC QUAN TRỌNG

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, resume.fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Download failed' });
  }
};

export const recommendResume = async (req, res) => {
  try {
    if (process.env.CV_RECOMMEND_URL) {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: 'CV không tồn tại' });
      }

      const relativePath = resume.fileUrl.startsWith('/')
        ? resume.fileUrl.slice(1)
        : resume.fileUrl;
      const filePath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File không tồn tại' });
      }

      const fileBuffer = await fs.promises.readFile(filePath);
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', blob, resume.fileName);

      const recommendUrl = process.env.CV_RECOMMEND_URL;
      const response = await fetch(recommendUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          'Recommend service returned error:',
          response.status,
          text,
        );
        return res
          .status(502)
          .json({ message: 'Dịch vụ gợi ý CV lỗi', detail: text });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    const data = await recommendJobsForResume(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    console.error('recommendResume error:', err);
    return res.status(500).json({ message: 'Recommend CV thất bại' });
  }
};
