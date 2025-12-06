import SupportTicket from '../models/SupportReportSchema.module.js';
import Feedback from '../models/Feedback.module.js';
import Employer from '../models/employer.model.js';
export const createSupportTicket = async (req, res) => {
  try {
    const userId = req.user.userId; // user._id từ token

    // 🔍 TÌM employer theo userId
    const employer = await Employer.findOne({ userId });

    if (!employer) {
      return res.status(400).json({
        message: 'Không tìm thấy thông tin nhà tuyển dụng',
      });
    }

    const employerId = employer._id;

    const { title, type, typeLabel, description } = req.body;

    // 🟢 Xử lý upload nhiều file
    const files = req.files.map((f) => ({
      fileUrl: `/uploads/support/${f.filename}`,
      fileName: f.originalname,
      fileType: f.mimetype,
    }));

    // 🟢 Tạo support ticket
    const ticket = await SupportTicket.create({
      employerId,
      title,
      type,
      typeLabel,
      description,
      files,
    });

    res.json({
      message: 'Gửi báo cáo thành công!',
      ticket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const createFeedback = async (req, res) => {
  try {
    const userId = req.user.userId; // userId từ token JWT

    // ---- 1) Tìm employer theo userId ----
    const employer = await Employer.findOne({ userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer không tồn tại.' });
    }

    const employerId = employer._id; // lấy employerId đúng

    // ---- 2) Lấy dữ liệu form ----
    const { category, content } = req.body;

    // ---- 3) Xử lý nhiều file ----
    console.log('FILES RECEIVED >>> ', req.files);
    const files = req.files.map((f) => ({
      fileUrl: `/uploads/feedback/${f.filename}`,
      fileName: f.originalname,
      fileType: f.mimetype,
    }));
    // ---- 4) Lưu Feedback ----
    const feedback = await Feedback.create({
      employerId,
      category,
      content,
      files,
    });

    res.json({
      message: 'Gửi góp ý thành công!',
      feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
