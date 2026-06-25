// middlewares/uploadChatFile.js
import { createUploader } from '../config/cloudinary.js';

const uploadChatFile = createUploader({
  folder: 'chat',
  allowedFormats: [
    'pdf',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'svg',
    'doc',
    'docx',
  ],
  fileSizeMB: 10,
});

export default uploadChatFile;
