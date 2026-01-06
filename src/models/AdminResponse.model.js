import mongoose from 'mongoose';

const AdminResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployerRequest',
      required: true,
    },

    adminId: { type: String, required: true },

    message: { type: String, required: true },

    // lưu lịch sử phản hồi
    attachments: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.model('AdminResponse', AdminResponseSchema);
