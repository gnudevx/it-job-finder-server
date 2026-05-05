import SupportReport from '../models/SupportReportSchema.module.js';
import Feedback from '../models/Feedback.module.js';
import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';

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
      files: t.files,
      status: t.status,
      createdAt: t.createdAt,
      replies: t.replies,
    }));

    const formattedFeedbacks = feedbacks.map((t) => ({
      id: t._id,
      type: 'FEEDBACK',
      title: t.category,
      content: t.content,
      files: t.files,
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
    await Notification.create({
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
