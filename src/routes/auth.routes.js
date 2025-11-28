import express from 'express';
import dotenv from 'dotenv';
import {
  googleLoginService,
  refreshTokenController,
} from '../services/auth.service.js';
import { login } from '../controllers/auth.controller.js';
import { register } from '../controllers/auth.controller.js';

dotenv.config();
const router = express.Router();
// LOGIN NORMAL
router.post('/login', login);
router.get('/refresh-token', refreshTokenController);
router.post('/register', register);
// GOOGLE LOGIN
router.post('/google', async (req, res) => {
  try {
    const result = await googleLoginService(req.body.code);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
