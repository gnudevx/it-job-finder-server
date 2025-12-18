import crypto from 'crypto';
import axios from 'axios';
import Payment from '../models/payment.model.js';
import Employer from '../models/employer.model.js';
const PACKAGE_MAP = {
  pkg_basic: { tier: 'FREE', amount: 0 },
  pkg_pro: { tier: 'PRO', amount: 1500000 },
  pkg_enterprise: { tier: 'ENTERPRISE', amount: 5000000 },
};
const TIER_DURATION = {
  PRO: 30, // 30 ngày
  ENTERPRISE: 30,
};
export const createMoMoPayment = async (req, res) => {
  const { packageId } = req.body;
  const userId = req.user.userId;
  const extraData = '';
  const pkg = PACKAGE_MAP[packageId];
  if (!pkg) {
    return res.status(400).json({ message: 'Gói không hợp lệ' });
  }

  const { tier, amount } = pkg;

  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const requestId = partnerCode + Date.now();
  const orderId = requestId;

  // 1️⃣ TẠO PAYMENT (PENDING)
  await Payment.create({
    userId,
    orderId,
    tier,
    amount,
    provider: 'MOMO',
    status: 'pending',
  });

  const redirectUrl = 'http://localhost:3000/employer/buy-services';
  const ipnUrl =
    'https://raylan-homoplastic-lourdes.ngrok-free.dev/api/payments/momo/ipn';

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=Upgrade ${tier}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}&requestType=captureWallet`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const response = await axios.post(
    'https://test-payment.momo.vn/v2/gateway/api/create',
    {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo: `Upgrade ${tier}`,
      redirectUrl,
      ipnUrl,
      requestType: 'captureWallet',
      signature,
      lang: 'vi',
      extraData,
    },
  );

  res.json({ payUrl: response.data.payUrl });
};
export const momoIPN = async (req, res) => {
  const { resultCode, orderId } = req.body;

  const payment = await Payment.findOne({ orderId });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (Number(resultCode) !== 0) {
    payment.status = 'rejected';
    await payment.save();
    return res.status(200).json({ message: 'Failed payment' });
  }

  const now = new Date();
  const durationDays = TIER_DURATION[payment.tier] || 0;

  payment.status = 'approved';
  payment.approvedAt = now;
  payment.expiresAt = new Date(
    now.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );
  await payment.save();

  // upgrade employer
  const employer = await Employer.findOne({ userId: payment.userId });
  if (employer) {
    employer.tier = payment.tier;
    employer.subscriptionExpiresAt = payment.expiresAt;
    await employer.save();
  }

  res.status(200).json({ message: 'OK' });
};
