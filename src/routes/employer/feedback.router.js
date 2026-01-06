import express from 'express';
import multer from 'multer';
import { createFeedback } from '../../controllers/useRequest.controller.js';

const router = express.Router();

// Multer upload
const upload = multer({ dest: 'uploads/feedback/' });

router.post('/', upload.array('files', 5), createFeedback);

export default router;
