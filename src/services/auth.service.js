import User from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage',
);

/* 1. LOGIN THƯỜNG */
export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email does not exist');

  if (!user.passwordHash) throw new Error('This account uses Google login');

  const match = await comparePassword(password, user.passwordHash);
  if (!match) throw new Error('Password is incorrect');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.lastLogin = new Date();
  await user.save();

  return {
    message: 'Login successfully',
    accessToken,
    refreshToken,
    user,
  };
};

/* 2. GOOGLE LOGIN */
export const googleLoginService = async (code) => {
  // Step 1: Exchange code for tokens
  const { tokens } = await client.getToken({
    code,
    redirect_uri: 'postmessage',
  });

  // Step 2: Verify ID Token to get user info
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const googleUser = ticket.getPayload();
  const email = googleUser.email;

  // Step 3: Find or create user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      passwordHash: null,
      role: 'candidate',
      status: 'active',
    });
  }

  // Step 4: Issue JWT tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Step 5: Update last login
  user.lastLogin = new Date();
  await user.save();

  return {
    success: true,
    message: 'Google login successfully',
    accessToken,
    refreshToken,
    user,
  };
};

/* 3. REGISTER */
export const registerService = async ({ email, password, fullname }) => {
  const emailExist = await User.findOne({ email });
  if (emailExist) throw new Error('Email already exists');

  if (!fullname) throw new Error('Fullname is required');

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash: hashedPassword,
    fullname,
    role: 'candidate',
    status: 'active',
  });

  return {
    message: 'Register successfully',
    user,
  };
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: 'Refresh token missing' });
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: 'Invalid or expired refresh token' });
      }
      const accessToken = generateAccessToken(decoded);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({ message: 'Refresh token successfully' });
    });
  } catch (err) {
    next(err);
  }
};
