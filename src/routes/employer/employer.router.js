import express from 'express';
import dotenv from 'dotenv';
import {
  getMe,
  updatePersonalInfo,
  getEmployerProgress,
  checkJobLimit,
} from '../../controllers/employer.controller.js';

dotenv.config();
const router = express.Router();

router.get('/', getMe);
router.put('/', updatePersonalInfo);
router.get('/progress', getEmployerProgress);
router.get('/job-limit', checkJobLimit);
export default router;
