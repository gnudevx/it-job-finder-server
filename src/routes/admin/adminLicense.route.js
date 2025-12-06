import express from 'express';
import adminLicenseController from '../../controllers/adminLicense.controller.js';

const router = express.Router();

router.get('/pending', adminLicenseController.getPending);
router.get('/history', adminLicenseController.getHistory);

router.patch('/review/:id', adminLicenseController.review);

export default router;
