import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, default: null },
  fullname: { type: String, default: '' },
  role: {
    type: String,
    enum: ['admin', 'candidate', 'employer'],
    default: 'candidate',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
});

const User = mongoose.model('USER', userSchema, 'USER');
export default User;
