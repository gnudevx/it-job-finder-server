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
import { upload } from '../../middlewares/upload.js';
import {
  uploadLicenseController,
  getLicenseInfo,
} from '../../controllers/employer.controller.js';

dotenv.config();
const router = express.Router();
router.put('/password', changePasswordController);

router.get('/company-info', getCompany);
router.get('/my-company-info', getMyCompany);
router.post('/company-info', createCompany);
router.put('/company-info/:id', updateCompany);
router.post('/select-company', selectCompany);

router.post('/license', upload.single('license'), uploadLicenseController);
router.get('/license-info', getLicenseInfo);
export default router;
