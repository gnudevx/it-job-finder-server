import express from 'express';
import dotenv from 'dotenv';
import { loginService, googleLoginService } from '../services/auth.service.js';

dotenv.config();
const router = express.Router();

// LOGIN NORMAL
router.post('/login', async (req, res) => {
  try {
    const result = await loginService(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

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
