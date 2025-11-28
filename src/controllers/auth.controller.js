import {
  loginService,
  googleLoginService,
  registerService,
} from '../services/auth.service.js';
import { changePasswordService } from '../services/user.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

/* 1. LOGIN NORMAL */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginService({ email, password });
    const { accessToken, refreshToken } = result;

    if (!accessToken || !refreshToken) {
      throw new Error('Service không trả về token');
    }

    // SET COOKIE
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/* 2. GOOGLE LOGIN */
export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await googleLoginService(code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* 3. CHANGE PASSWORD */
export const changePasswordController = async (req, res, next) => {
  try {
    const { newPassword, reNewPassword } = req.body;

    if (newPassword !== reNewPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const userId = req.user.userId;
    const user = await changePasswordService(userId, newPassword);

    return res.json({
      message: 'Password updated successfully',
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

/* 4. REGISTER + AUTO LOGIN */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullname } = req.body;

    if (!email || !password || !fullname) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 chars' });
    }

    const { user } = await registerService({
      email,
      password,
      fullname,
    });

    // AUTO LOGIN
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // SET COOKIE
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Register successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
