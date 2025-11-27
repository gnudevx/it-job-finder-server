import express from 'express';
import dotenv from 'dotenv';
import {
  createCompany,
  updateCompany,
  getCompany,
  selectCompany,
  getMyCompany,
} from '../../controllers/company.controller.js';
import { changePasswordController } from '../../controllers/auth.controller.js';
dotenv.config();
const router = express.Router();
router.put('/password', changePasswordController);

router.get('/company-info', getCompany);
router.get('/my-company-info', getMyCompany);
router.post('/company-info', createCompany);
router.put('/company-info/:id', updateCompany);
router.post('/select-company', selectCompany);

export default router;
