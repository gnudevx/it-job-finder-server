import User from '../models/user.model.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email is not exist');

  const match = await comparePassword(password, user.passwordHash);
  if (!match) throw new Error('Password is not correct');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    message: 'Login successfully',
    accessToken,
    refreshToken,
  };
};

export const registerService = async ({
  email,
  password,
  fullname,
  username,
}) => {
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) throw new Error('Email is exist');
  const isUsernameExist = await User.findOne({ username });
  if (isUsernameExist) throw new Error('Username is exist');
  const hashedPassword = await hashPassword(password);
  const user = new User({
    email,
    passwordHash: hashedPassword,
    fullname,
    username,
  });
  await user.save();
  console.log('User registered successfully:', user);
  return {
    message: 'Register Successfully',
  };
};
