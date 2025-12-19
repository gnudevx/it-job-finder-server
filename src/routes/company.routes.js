// routes/company.route.js
import express from 'express';
import { getCompanyPublicController } from '../controllers/company.controller.js';

const router = express.Router();

// GET /api/company/by-employer/:employerId
router.get('/by-employer/:employerId', getCompanyPublicController);

export default router;
