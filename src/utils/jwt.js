import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// ACCESS TOKEN (hết hạn nhanh, bảo mật chính)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role.toUpperCase() },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }, // 1h là chuẩn, bạn có thể đổi thành "7d"
  );
};

// REFRESH TOKEN (hạn dài, chỉ dùng để xin access token mới)
export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

// VERIFY ACCESS TOKEN
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch {
    return null;
  }
};
