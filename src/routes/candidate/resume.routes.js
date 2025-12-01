import express from 'express';
import uploadResume from '../../middlewares/uploadResume.js';
import {
  uploadResume as upload,
  getResumes,
  deleteResume,
  setDefaultResume,
} from '../../controllers/resume.controller.js';
import Resume from '../../models/resumes.model.js';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Upload CV
router.post('/upload', uploadResume.single('file'), upload);

// Lấy danh sách CV
router.get('/', getResumes);

// Xoá CV
router.delete('/:id', deleteResume);

// Đặt CV mặc định
router.put('/default/:id', setDefaultResume);

// Xem CV
router.get('/:id/view', verifyAccessToken, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).send('CV không tồn tại');

    const filePath = path.join(process.cwd(), resume.fileUrl);
    if (!fs.existsSync(filePath))
      return res.status(404).send('File không tồn tại');

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
