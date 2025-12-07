import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ message: 'Missing authorization header' });

    const token = authHeader.split(' ')[1];
    if (!token)
      return res.status(401).json({ message: 'Invalid authorization format' });

    const decoded = verifyAccessToken(token);
    if (!decoded)
      return res.status(401).json({ message: 'Invalid or expired token' });

    // Kiểm tra user có tồn tại trong DB không
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    // lưu user vào req
    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};
