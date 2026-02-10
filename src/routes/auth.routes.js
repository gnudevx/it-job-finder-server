import express from 'express';
import dotenv from 'dotenv';
import { refreshTokenController } from '../services/auth.service.js';
import { login, googleLogin } from '../controllers/auth.controller.js';
import { register } from '../controllers/auth.controller.js';
import AuthLog from '../models/authLog.model.js';
import { getAuthLogs } from '../controllers/authLog.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
dotenv.config();
const router = express.Router();
// LOGIN NORMAL
router.post('/login', login);
router.get('/refresh-token', refreshTokenController);
router.post('/logout', verifyAccessToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 🔹 GHI LOG LOGOUT
    await AuthLog.create({
      userId,
      action: 'LOGOUT',
    });

    // 🔹 CLEAR COOKIE
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' }, err);
  }
});
router.post('/register', register);
// GOOGLE LOGIN
router.post('/google', googleLogin);
router.get('/logs', verifyAccessToken, getAuthLogs);
export default router;
