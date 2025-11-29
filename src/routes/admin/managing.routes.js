import { loadAllCandidate } from '../../controllers/candidate.controller.js';
import { AllEmployer } from '../../controllers/employer.controller.js';

import express from 'express';

const router = express.Router();

router.get('/candidates', loadAllCandidate);
router.get('/employers', AllEmployer);

export default router;
