import express from 'express';
import {
  getPersonalInfo,
  updatePersonalInfo,
  changePassword,
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/personal-info', getPersonalInfo);
router.put('/personal-info', updatePersonalInfo);
router.put('/change-password', changePassword);

export default router;
