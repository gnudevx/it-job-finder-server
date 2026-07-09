import jwt from 'jsonwebtoken';

const accessTokenSecret =
  process.env.JWT_ACCESS_SECRET ||
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET;
const refreshTokenSecret =
  process.env.JWT_REFRESH_SECRET ||
  process.env.REFRESH_TOKEN_SECRET ||
  process.env.JWT_SECRET;

export const generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id }, accessTokenSecret, {
    expiresIn: '1h',
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, refreshTokenSecret, {
    expiresIn: '7d',
  });
};
