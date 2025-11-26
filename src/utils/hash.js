import bcrypt from "bcryptjs";

// Mã hóa password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// So sánh password nhập vào với passwordHash trong DB
export const comparePassword = async (password, hashed) => {
  if (!hashed) return false; // tài khoản Google đăng nhập không có password
  return await bcrypt.compare(password, hashed);
};
