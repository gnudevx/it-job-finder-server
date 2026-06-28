import { createUploader } from '../config/cloudinary.js';

const uploadChatFile = createUploader({
  folder: 'chat',
  allowedFormats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'webp'],
  fileSizeMB: 10,
});

export default uploadChatFile;
