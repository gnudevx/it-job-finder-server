import User from '../models/User.js';
import Candidate from '../models/candidate.model.js';
import Employer from '../models/employer.model.js'; // Add this import
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
  await user.save({ validateBeforeSave: false });

  return {
    message: 'Login successfully',
    accessToken,
    refreshToken,
    user,
  };
};

/* 2. GOOGLE LOGIN */
export const googleLoginService = async (code) => {
  const { tokens } = await client.getToken({
    code,
    redirect_uri: 'postmessage',
  });

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const googleUser = ticket.getPayload();
  const email = googleUser.email;
  const fullname = googleUser.name || email.split('@')[0];

  let user = await User.findOne({ email });

  if (!user) {
    // Create new user with default role 'candidate'
    user = await User.create({
      email,
      passwordHash: null,
      fullname,
      role: 'candidate',
      status: 'active',
    });

    // Create Candidate profile for Google login users (default role)
    await Candidate.create({
      fullName: fullname,
      email: email,
      gender: 'other',
      userId: user._id,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

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
export const registerService = async ({
  email,
  password,
  fullname,
  role = 'candidate',
  gender = 'other',
}) => {
  const emailExist = await User.findOne({ email });
  if (emailExist) throw new Error('Email already exists');

  if (!fullname) throw new Error('Fullname is required');

  // Validate role
  const validRoles = ['candidate', 'employer', 'admin'];
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role');
  }
  const validGenders = ['male', 'female', 'other'];
  if (!validGenders.includes(gender)) {
    throw new Error('Invalid gender');
  }

  const hashedPassword = await hashPassword(password);

  // Create User
  const user = await User.create({
    email,
    passwordHash: hashedPassword,
    fullname,
    role: role,
    gender: gender,
    status: 'active',
  });

  let candidate = null;
  let employer = null;

  // Create role-specific profile
  if (role === 'candidate') {
    candidate = await Candidate.create({
      fullName: fullname,
      email: email,
      userId: user._id,
    });
  } else if (role === 'employer') {
    employer = await Employer.create({
      fullName: fullname,
      email: email,
      gender: gender,
      userId: user._id,
      tier: 'FREE',
      creditBalance: 0,
      phoneVerified: false,
    });
  }

  return {
    message: 'Register successfully',
    user,
    candidate,
    employer,
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).json({ accessToken });
    });
  } catch (err) {
    next(err);
  }
};
