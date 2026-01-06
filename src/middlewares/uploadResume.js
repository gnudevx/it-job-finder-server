import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .pdf
    const name = path.basename(file.originalname, ext); // filename không có .pdf

    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed!'), false);
  }
  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default uploadResume;
