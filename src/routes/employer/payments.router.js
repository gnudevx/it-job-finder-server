// routes/payment.routes.js
import express from 'express';
import {
  createMoMoPayment,
  momoIPN,
  createStripePayment,
  getPaymentStatus,
} from '../../controllers/payment.controller.js';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ─── GENERAL ──────────────────────
router.get('/status/:orderId', verifyAccessToken, getPaymentStatus);

// ─── MOMO ─────────────────────────
router.post('/momo/create', verifyAccessToken, createMoMoPayment);
router.post('/momo/ipn', momoIPN);

// ─── STRIPE ───────────────────────
router.post('/stripe/create', verifyAccessToken, createStripePayment);
// Webhook dùng raw body → được mount riêng trong app.js
// router.post('/stripe/webhook', ...) → xem app.js

export default router;
