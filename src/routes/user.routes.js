import express from 'express';
import {
  getPersonalInfo,
  updatePersonalInfo,
  changePassword,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/jwt.js';

const router = express.Router();

router.get('/personal-info', verifyToken, getPersonalInfo);
router.put('/personal-info', verifyToken, updatePersonalInfo);
router.put('/change-password', verifyToken, changePassword);

export default router;
