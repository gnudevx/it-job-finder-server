import mongoose from 'mongoose';

const accountActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'UPDATE_PROFILE', // updatePersonalInfo
        'UPLOAD_LICENSE', // uploadLicenseController
        'VERIFY_PHONE', // verifyPhoneController
        'CHANGE_PASSWORD',
        'UPDATE_EMAIL',
        'UPDATE_AVATAR',
        'UPGRADE_PACKAGE',
        'PAYMENT_FAILED',
      ],
    },
    meta: { type: Object },
  },
  { timestamps: true },
);

export default mongoose.model('AccountActivity', accountActivitySchema);
