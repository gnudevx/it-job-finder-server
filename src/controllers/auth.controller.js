import {
  loginService,
  googleLoginService,
  registerService,
} from '../services/auth.service.js';
import { changePasswordService } from '../services/user.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

/* 1. LOGIN NORMAL */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginService({ email, password });
    const { accessToken, refreshToken } = result;

    if (!accessToken || !refreshToken) {
      throw new Error('Service không trả về token');
    }

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

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/* 2. GOOGLE LOGIN */
export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await googleLoginService(code);

    const { accessToken, refreshToken } = result;

    // Set cookies for Google login too
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

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/* 3. CHANGE PASSWORD */
export const changePasswordController = async (req, res, next) => {
  try {
    const { newPassword, reNewPassword } = req.body;

    if (newPassword !== reNewPassword)
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });

    const userId = req.user.userId;
    const user = await changePasswordService(userId, newPassword);

    return res.json({
      success: true,
      message: 'Password updated successfully',
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

/* 4. REGISTER + AUTO LOGIN */
export const register = async (req, res) => {
  try {
    const { email, password, fullname, role, gender } = req.body;

    if (!email || !password || !fullname || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 chars',
      });
    }

    const { user, candidate, employer } = await registerService({
      email,
      password,
      fullname,
      role: role || 'candidate',
      gender,
    });

    // AUTO LOGIN - Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
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

    // Log for debugging
    console.log('✅ Registration successful, tokens set for user:', user.email);
    console.log('🔑 Access token expires in: 1 hour');
    console.log('🔑 Refresh token expires in: 7 days');

    return res.status(201).json({
      success: true,
      message: 'Register successfully',
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        status: user.status,
      },
      candidate: candidate || null,
      employer: employer || null,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

/* 5. LOGOUT */
export const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
