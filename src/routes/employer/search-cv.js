// routes/payment.routes.js
import express from 'express';
import { employerSearchCV } from '../../controllers/employerSearchCv.controller.js';
const router = express.Router();
router.get('/', employerSearchCV);
export default router;
