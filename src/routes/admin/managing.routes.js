import {
  createCandidate,
  loadAllCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from '../../controllers/candidate.controller.js';
import { AllEmployer } from '../../controllers/employer.controller.js';

import express from 'express';

const router = express.Router();

// Create
router.post('/candidates', createCandidate);

// Read
router.get('/candidates', loadAllCandidate);
router.get('/candidates/:id', getCandidateById);

// Profile
router.put('/candidates/:id', updateCandidate);

// Delete
router.delete('/candidates/:id', deleteCandidate);

router.get('/employers', AllEmployer);

export default router;
