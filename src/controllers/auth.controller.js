import authService from '../services/auth.service.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await authService.googleLogin(code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
