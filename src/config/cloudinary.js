import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Factory function — tạo uploader cho từng folder
export function createUploader({ folder, allowedFormats, fileSizeMB = 10 }) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder,
      allowed_formats: allowedFormats,
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
    }),
  });

  const fileFilter = (req, file, cb) => {
    const allowed = allowedFormats.flatMap((fmt) => {
      const map = {
        pdf: ['application/pdf'],
        docx: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        doc: ['application/msword'],
        jpg: ['image/jpeg'],
        jpeg: ['image/jpeg'],
        png: ['image/png'],
        gif: ['image/gif'],
        webp: ['image/webp'],
        svg: ['image/svg+xml'],
      };
      return map[fmt] || [];
    });

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('File type not supported'), false);
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: fileSizeMB * 1024 * 1024 },
  });
}
