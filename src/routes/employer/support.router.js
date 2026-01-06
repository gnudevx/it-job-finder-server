import express from 'express';
import multer from 'multer';
import { createSupportTicket } from '../../controllers/useRequest.controller.js';

const router = express.Router();

// Multer upload
const upload = multer({ dest: 'uploads/support/' });

router.post('/', upload.array('files', 5), createSupportTicket);

export default router;
