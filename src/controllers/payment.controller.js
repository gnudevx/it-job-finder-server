import crypto from 'crypto';
import axios from 'axios';
import Stripe from 'stripe';
import qs from 'qs';
import Payment from '../models/payment.model.js';
import Employer from '../models/employer.model.js';
import AccountActivity from '../models/accountActivity.model.js';

// ─── CONFIG ───────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGE_MAP = {
  pkg_basic: { tier: 'FREE', amount: 0 },
  pkg_pro: { tier: 'PRO', amount: 1500000 },
  pkg_enterprise: { tier: 'ENTERPRISE', amount: 5000000 },
};

const TIER_DURATION = {
  PRO: 30, // 30 ngày
  ENTERPRISE: 30,
};

// ─── HELPER: Upgrade employer tier ────────────────────────
const upgradeEmployer = async (payment) => {
  const now = new Date();
  const durationDays = TIER_DURATION[payment.tier] || 0;

  payment.status = 'approved';
  payment.approvedAt = now;
  payment.expiresAt = new Date(
    now.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );
  await payment.save();

  const employer = await Employer.findOne({ userId: payment.userId });
  if (employer) {
    employer.tier = payment.tier;
    employer.subscriptionExpiresAt = payment.expiresAt;
    await employer.save();
    await AccountActivity.create({
      userId: payment.userId,
      action: 'UPGRADE_PACKAGE',
      meta: {
        tier: payment.tier,
        amount: payment.amount,
        provider: payment.provider,
        orderId: payment.orderId,
        expiresAt: payment.expiresAt,
      },
    });
  }
};

const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  });

  return sorted;
};
// MOMO

export const createMoMoPayment = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.userId;
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
    const extraData = '';

    // 1️⃣ TẠO PAYMENT (PENDING)
    await Payment.create({
      userId,
      orderId,
      tier,
      amount,
      provider: 'MOMO',
      status: 'pending',
    });

    const redirectUrl =
      process.env.MOMO_REDIRECT_URL ||
      'http://localhost:3000/employer/payment/result';
    const ipnUrl =
      process.env.MOMO_IPN_URL ||
      'https://raylan-homoplastic-lourdes.ngrok-free.dev/api/payments/momo/ipn';

    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}&orderInfo=Upgrade_${tier}` +
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
  } catch (err) {
    console.error('MoMo create error:', err?.response?.data || err.message);
    res
      .status(500)
      .json({ message: 'Lỗi tạo thanh toán MoMo', error: err.message });
  }
};

export const momoIPN = async (req, res) => {
  try {
    const { resultCode, orderId } = req.body;
    console.log('MoMo IPN body:', req.body);

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (Number(resultCode) !== 0) {
      payment.status = 'rejected';
      await payment.save();
      await AccountActivity.create({
        userId: payment.userId,
        action: 'PAYMENT_FAILED',
        meta: { orderId, provider: 'MOMO', resultCode },
      });
      return res.status(200).json({ message: 'Failed payment' });
    }

    await upgradeEmployer(payment);
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('MoMo IPN error:', err);
    res.status(500).json({ message: 'IPN error' });
  }
};

// STRIPE

export const createStripePayment = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.userId;
    const pkg = PACKAGE_MAP[packageId];

    if (!pkg) {
      return res.status(400).json({ message: 'Gói không hợp lệ' });
    }

    const { tier, amount } = pkg;

    // Stripe dùng đơn vị nhỏ nhất (cents). VND không có decimal → amount giữ nguyên
    const orderId = `STRIPE_${Date.now()}_${userId}`;

    // 1️⃣ TẠO PAYMENT (PENDING)
    await Payment.create({
      userId,
      orderId,
      tier,
      amount,
      provider: 'STRIPE',
      status: 'pending',
    });

    const successBase =
      process.env.STRIPE_SUCCESS_URL ||
      'http://localhost:3000/employer/payment/result?provider=stripe&status=success';
    const successUrl = successBase.includes('?')
      ? `${successBase}&orderId=${orderId}&sessionId={CHECKOUT_SESSION_ID}`
      : `${successBase}?orderId=${orderId}&sessionId={CHECKOUT_SESSION_ID}`;

    const cancelBase =
      process.env.STRIPE_CANCEL_URL ||
      'http://localhost:3000/employer/payment/result?provider=stripe&status=cancel';
    const cancelUrl = cancelBase.includes('?')
      ? `${cancelBase}&orderId=${orderId}`
      : `${cancelBase}?orderId=${orderId}`;

    // 2️⃣ TẠO STRIPE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `IT Job Finder – Upgrade ${tier}`,
              description: `Nâng cấp tài khoản lên gói ${tier} (30 ngày)`,
            },
            unit_amount: amount, // VND không có decimal
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId,
        userId: userId.toString(),
        tier,
        packageId,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe create error:', err.message);
    res
      .status(500)
      .json({ message: 'Lỗi tạo thanh toán Stripe', error: err.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (
      process.env.NODE_ENV === 'development' &&
      req.headers['x-mock-stripe'] === 'true'
    ) {
      event = JSON.parse(req.body.toString());
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error('Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3️⃣ XỬ LÝ EVENT
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId, userId, tier } = session.metadata;

    console.log('Stripe checkout completed:', { orderId, userId, tier });

    try {
      const payment = await Payment.findOne({ orderId });
      if (!payment) {
        console.error('Stripe webhook: Payment not found for orderId', orderId);
        return res.status(404).json({ message: 'Payment not found' });
      }

      await upgradeEmployer(payment);
      console.log(`Stripe: Upgraded user ${userId} to ${tier}`);
    } catch (err) {
      console.error('Stripe webhook processing error:', err);
      return res.status(500).json({ message: 'Webhook processing error' });
    }
  }

  res.status(200).json({ received: true });
};

// VNPAY
export const createVNPayPayment = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.userId;

    const pkg = PACKAGE_MAP[packageId];

    if (!pkg) {
      return res.status(400).json({
        message: 'Gói không hợp lệ',
      });
    }

    const { tier, amount } = pkg;

    const orderId = `VNPAY_${Date.now()}`;

    await Payment.create({
      userId,
      orderId,
      tier,
      amount,
      provider: 'VNPAY',
      status: 'pending',
    });

    const ipAddr =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const createDate = new Date();

    const dateFormat =
      createDate.getFullYear().toString() +
      ('0' + (createDate.getMonth() + 1)).slice(-2) +
      ('0' + createDate.getDate()).slice(-2) +
      ('0' + createDate.getHours()).slice(-2) +
      ('0' + createDate.getMinutes()).slice(-2) +
      ('0' + createDate.getSeconds()).slice(-2);

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNP_TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Upgrade ${tier}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      // vnp_IpnUrl: process.env.VNP_IPN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: dateFormat,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, {
      encode: false,
    });

    const secureHash = crypto
      .createHmac('sha512', process.env.VNP_HASH_SECRET)
      .update(signData, 'utf8')
      .digest('hex');

    vnp_Params.vnp_SecureHash = secureHash;

    const paymentUrl =
      process.env.VNP_URL +
      '?' +
      qs.stringify(vnp_Params, {
        encode: false,
      });

    console.log('SIGN DATA:', signData);
    console.log('SECURE HASH:', secureHash);
    console.log('PAY URL:', paymentUrl);

    return res.json({
      payUrl: paymentUrl,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Lỗi tạo thanh toán VNPAY',
    });
  }
};

export const vnpayIPN = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };

    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const signData = qs.stringify(sortObject(vnp_Params), {
      encode: false,
    });

    const signed = crypto
      .createHmac('sha512', process.env.VNP_HASH_SECRET)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    if (secureHash !== signed) {
      return res.status(400).json({
        RspCode: '97',
        Message: 'Invalid checksum',
      });
    }

    const { vnp_TxnRef, vnp_ResponseCode } = req.query;

    const payment = await Payment.findOne({
      orderId: vnp_TxnRef,
    });

    if (!payment) {
      return res.status(404).json({
        RspCode: '01',
        Message: 'Order not found',
      });
    }

    if (payment.status === 'approved') {
      return res.json({
        RspCode: '00',
        Message: 'Already confirmed',
      });
    }

    if (vnp_ResponseCode !== '00') {
      payment.status = 'rejected';
      await payment.save();

      return res.json({
        RspCode: '00',
        Message: 'Confirm Success',
      });
    }

    await upgradeEmployer(payment);

    return res.json({
      RspCode: '00',
      Message: 'Confirm Success',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      RspCode: '99',
      Message: 'Unknown error',
    });
  }
};

export const verifyVNPayReturn = async (req, res) => {
  const vnp_Params = { ...req.query };

  const secureHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const signData = qs.stringify(sortObject(vnp_Params), { encode: false });

  const signed = crypto
    .createHmac('sha512', process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  if (secureHash !== signed) {
    return res.status(400).json({
      success: false,
      message: 'Invalid checksum',
    });
  }

  const payment = await Payment.findOne({
    orderId: req.query.vnp_TxnRef,
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
    });
  }

  if (req.query.vnp_ResponseCode === '00' && payment.status !== 'approved') {
    await upgradeEmployer(payment);
  }

  return res.json({
    success: true,
  });
};

export const createQRDemoPayment = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.userId;

    const pkg = PACKAGE_MAP[packageId];

    if (!pkg) {
      return res.status(400).json({
        message: 'Gói không hợp lệ',
      });
    }

    const orderId = `QR_${Date.now()}`;

    const payment = await Payment.create({
      userId,
      orderId,
      tier: pkg.tier,
      amount: pkg.amount,
      provider: 'QR',
      status: 'pending',
    });

    res.json({
      payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Lỗi tạo QR',
    });
  }
};

export const confirmQRDemoPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      orderId,
    });

    if (!payment) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn hàng',
      });
    }

    if (payment.status === 'approved') {
      return res.json({
        success: true,
      });
    }

    await upgradeEmployer(payment);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Lỗi xác nhận',
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sessionId } = req.query;
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    // Verify that the payment belongs to the logged-in user
    if (payment.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Sync with Stripe if status is pending and we have a sessionId
    if (
      payment.status === 'pending' &&
      payment.provider === 'STRIPE' &&
      sessionId
    ) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === 'paid') {
          // Double check metadata to prevent tampering
          if (session.metadata && session.metadata.orderId === orderId) {
            await upgradeEmployer(payment);
            // Fetch updated payment
            const updatedPayment = await Payment.findOne({ orderId });
            return res.json(updatedPayment);
          }
        }
      } catch (stripeErr) {
        console.error(
          'Error retrieving/syncing Stripe session:',
          stripeErr.message,
        );
      }
    }

    res.json(payment);
  } catch (err) {
    console.error('Get payment status error:', err.message);
    res
      .status(500)
      .json({ message: 'Lỗi lấy trạng thái đơn hàng', error: err.message });
  }
};
