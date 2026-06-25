import { createUploader } from '../config/cloudinary.js';

const uploadResume = createUploader({
  folder: 'resumes',
  allowedFormats: ['pdf', 'doc', 'docx'],
  fileSizeMB: 5,
});

export default uploadResume;
