import SupportReport from '../models/SupportReportSchema.module.js';
import Feedback from '../models/Feedback.module.js';
import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';

// 🔗 Ghép domain backend vào đường dẫn file tương đối lưu trong DB
// (fileUrl lưu dạng "/uploads/feedback/xxx", cần domain đầy đủ để client mở đúng file)
const buildFileUrl = (req, url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url; // đã là URL tuyệt đối thì giữ nguyên
  return `${req.protocol}://${req.get('host')}${url}`;
};

const withAbsoluteFileUrls = (req, files = []) =>
  (files || []).map((f) => ({
    ...f,
    fileUrl: buildFileUrl(req, f.fileUrl),
  }));

// 1) Lấy toàn bộ ticket

export const getAdminTickets = async (req, res) => {
  try {
    const supports = await SupportReport.find().lean();
    const feedbacks = await Feedback.find().lean();

    const formattedSupports = supports.map((t) => ({
      id: t._id,
      type: 'SUPPORT',
      title: t.title,
      content: t.description,
      files: withAbsoluteFileUrls(req, t.files),
      status: t.status,
      createdAt: t.createdAt,
      replies: t.replies,
    }));

    const formattedFeedbacks = feedbacks.map((t) => ({
      id: t._id,
      type: 'FEEDBACK',
      title: t.category,
      content: t.content,
      files: withAbsoluteFileUrls(req, t.files),
      status: t.status,
      createdAt: t.createdAt,
      replies: t.replies,
    }));

    const merged = [...formattedSupports, ...formattedFeedbacks].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json({ success: true, data: merged });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không lấy được danh sách ticket' });
  }
};

// 2) Lấy chi tiết một ticket
export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Try to find in SupportReport first
    let ticket = await SupportReport.findById(ticketId).lean();
    let type = 'SUPPORT';

    // If not found, try in Feedback
    if (!ticket) {
      ticket = await Feedback.findById(ticketId).lean();
      type = 'FEEDBACK';
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket không tồn tại' });
    }

    // Format response
    const formattedTicket = {
      id: ticket._id,
      type,
      title: type === 'SUPPORT' ? ticket.title : ticket.category,
      content: type === 'SUPPORT' ? ticket.description : ticket.content,
      files: withAbsoluteFileUrls(req, ticket.files),
      status: ticket.status,
      createdAt: ticket.createdAt,
      replies: ticket.replies,
    };

    res.json({ success: true, data: formattedTicket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không lấy được chi tiết ticket' });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content, type } = req.body; // type = SUPPORT or FEEDBACK
    const adminId = req.user.userId;

    const Model = type === 'SUPPORT' ? SupportReport : Feedback;

    const ticket = await Model.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket không tồn tại' });

    ticket.replies.push({
      _id: new mongoose.Types.ObjectId(),
      sender: 'ADMIN',
      content,
      timestamp: new Date(),
    });
    ticket.status = 'reviewing';
    console.log('Updated Ticket:', ticket);
    await ticket.save();

    const notification = await Notification.create({
      title: `Phản hồi từ admin cho yêu cầu: ${ticket.category || ticket.title}`,
      message: content,
      type: 'SYSTEM',
      recipientRole: 'EMPLOYER',
      recipientId: ticket.employerId.toString(),
      createdBy: adminId,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${ticket.employerId.toString()}`).emit(
        'notification:new',
        notification,
      );
    }
    return res
      .status(200)
      .json({ replyId: ticket.replies[ticket.replies.length - 1]._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không gửi phản hồi' });
  }
};
export const changeTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, type } = req.body;

    const Model = type === 'SUPPORT' ? SupportReport : Feedback;

    const updated = await Model.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true },
    );

    if (!updated)
      return res.status(404).json({ error: 'Ticket không tồn tại' });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không cập nhật trạng thái' });
  }
};
