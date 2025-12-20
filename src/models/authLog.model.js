import mongoose from 'mongoose';

const authLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  action: {
    type: String,
    enum: ['LOGIN', 'LOGOUT'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AUTH_LOG', authLogSchema);
