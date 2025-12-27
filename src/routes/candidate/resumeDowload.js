import express from 'express';
import { downloadResume } from '../../controllers/resume.controller.js';

const router = express.Router();
router.get('/:id', downloadResume);
export default router;
