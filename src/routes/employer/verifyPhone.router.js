import express from 'express';
import dotenv from 'dotenv';
import { verifyPhoneController } from '../../controllers/employer.controller.js';

dotenv.config();
const router = express.Router();

router.post('/phone-verify', verifyPhoneController);
export default router;
