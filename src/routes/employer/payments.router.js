// routes/payment.routes.js
import express from 'express';
import {
  createMoMoPayment,
  momoIPN,
} from '../../controllers/payment.controller.js';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/momo/create', verifyAccessToken, createMoMoPayment);
router.post('/momo/ipn', momoIPN);
export default router;
