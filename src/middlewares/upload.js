import { createUploader } from '../config/cloudinary.js';

export const upload = createUploader({
  folder: 'licenses',
  allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  fileSizeMB: 10,
});
