import { loginService, googleLoginService } from '../services/auth.service.js';
import { changePasswordService } from '../services/user.service.js';
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // gọi service
    const result = await loginService({ email, password });
    const { accessToken, refreshToken } = result;
    if (!accessToken || !refreshToken) {
      throw new Error('Service không trả về token');
    }
    // Set accessToken vào cookie
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
      maxAge: 60 * 60 * 1000, // 15 phút
    });
    // Trả response
    res.json(result); // bao gồm message, user, accessToken, refreshToken
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await googleLoginService(code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { newPassword, reNewPassword } = req.body;

    // Kiểm tra 2 trường có khớp không
    if (newPassword !== reNewPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const userId = req.user.userId; // Lấy từ JWT (middleware auth)
    const user = await changePasswordService(userId, newPassword);

    res.json({ message: 'Password updated successfully', userId: user._id });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Server error' });
  }
};
