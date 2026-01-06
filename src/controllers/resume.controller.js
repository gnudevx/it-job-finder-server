import Resume from '../models/resumes.model.js';
import candidateService from '../services/candidate.service.js';
import fs from 'fs';
export const uploadResume = async (req, res) => {
  try {
    const candidate = await candidateService.getMyInfo(req.user.userId);

    if (!candidate)
      return res.status(404).json({ message: 'Candidate not found' });

    const candidateId = candidate._id;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const newResume = await Resume.create({
      candidateId,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: 'pdf',
      size: req.file.size,
      isDefault: false,
    });

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

    const filePath = '.' + resume.fileUrl; // 🔥 CỰC QUAN TRỌNG

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, resume.fileName || 'CV.pdf');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Download failed' });
  }
};
