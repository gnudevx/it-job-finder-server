// routes/payment.routes.js
import express from 'express';
import {
  createMoMoPayment,
  momoIPN,
  createStripePayment,
  getPaymentStatus,
  createVNPayPayment,
  vnpayIPN,
  verifyVNPayReturn,
  createQRDemoPayment,
  confirmQRDemoPayment,
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
router.post('/vnpay/create', verifyAccessToken, createVNPayPayment);

router.get('/vnpay/ipn', vnpayIPN);
router.get('/vnpay/return', verifyVNPayReturn);
router.post('/qr/create', verifyAccessToken, createQRDemoPayment);

router.post('/qr/confirm/:orderId', verifyAccessToken, confirmQRDemoPayment);

export default router;
