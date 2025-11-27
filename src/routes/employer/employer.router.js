import express from 'express';
import dotenv from 'dotenv';
import {
  getMe,
  updatePersonalInfo,
} from '../../controllers/employer.controller.js';

dotenv.config();
const router = express.Router();

router.get('/', getMe);
router.put('/', updatePersonalInfo);

export default router;
