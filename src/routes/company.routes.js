// routes/company.route.js
import express from 'express';
import {
  getCompanyByEmployerPublic,
  getCompanyByIdPublic,
} from '../controllers/company.controller.js';

const router = express.Router();

// GET /api/company/by-employer/:employerId
router.get('/by-employer/:employerId', getCompanyByEmployerPublic);
router.get('/:id', getCompanyByIdPublic);

export default router;
