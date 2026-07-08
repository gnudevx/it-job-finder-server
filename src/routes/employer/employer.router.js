import express from 'express';
import dotenv from 'dotenv';
import {
  getMe,
  updatePersonalInfo,
  getEmployerProgress,
  checkJobLimit,
  selectEmployerPackage,
} from '../../controllers/employer.controller.js';
import { checkSubscription } from '../../middlewares/checkSubscription.js';
dotenv.config();
const router = express.Router();

router.get('/', checkSubscription, getMe);
router.put('/', updatePersonalInfo);
router.post('/package/select', selectEmployerPackage);
router.get('/progress', getEmployerProgress);
router.get('/job-limit', checkJobLimit);
export default router;
