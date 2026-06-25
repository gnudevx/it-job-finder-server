import jwt from 'jsonwebtoken';
export const verifyAccessToken = (req, res, next) => {
  // Ưu tiên 1: Cookie (khi frontend và server cùng domain / Docker local)
  // Ưu tiên 2: Authorization header Bearer token (khi cross-domain production)
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = {
      userId: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
