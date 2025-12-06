import Notification from '../models/notification.model.js';
import NotificationRead from '../models/NotificationReadSchema.model.js';
import Employer from '../models/employer.model.js';
export const NotificationController = {
  /** ============================
   *  ADMIN CREATE NOTIFICATION
   * ============================ */
  async create(req, res) {
    try {
      const { title, message, type, recipientRole, recipientId } = req.body;

      if (!title || !message || !recipientRole)
        return res.status(400).json({ message: 'Missing required fields' });

      const newNoti = await Notification.create({
        title,
        message,
        type: type || 'SYSTEM',
        recipientRole,
        recipientId: recipientId || null,
        createdBy: req.user.userId,
      });

      // SOCKET BROADCAST
      const io = req.app.get('io');
      if (io) {
        // gửi theo role (vd: EMPLOYER)
        io.to(`role:${recipientRole}`).emit('notification:new', newNoti);

        // gửi riêng tư
        if (recipientId) {
          io.to(`user:${recipientId}`).emit('notification:new', newNoti);
        }
      }

      return res.status(201).json({ success: true, data: newNoti });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: e.message });
    }
  },

  /** ============================
   *  ADMIN LIST + FILTER + PAGINATION
   * ============================ */
  async adminList(req, res) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 50, 100);

      const filter = {};

      // lọc theo loại thông báo (SYSTEM / FEATURE / ALERT / PROMOTION)
      if (req.query.type) filter.type = req.query.type;

      // lọc theo đối tượng nhận (CANDIDATE / EMPLOYER)
      if (req.query.role) filter.recipientRole = req.query.role;

      // search theo tiêu đề
      if (req.query.q) {
        filter.title = { $regex: req.query.q, $options: 'i' };
      }

      const total = await Notification.countDocuments(filter);

      const list = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // ✨ CHUYỂN ĐỔI DỮ LIỆU CHO FRONT-END
      const items = list.map((n) => ({
        id: n._id, // frontend dùng item.id
        title: n.title,
        message: n.message,
        type: n.type,
        recipientId: n.recipientId === null ? 'ALL' : n.recipientId,
        recipientRole: n.recipientRole,
        sentAt: n.createdAt, // frontend dùng sentAt
      }));

      res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /** ============================
   *  USER LIST (EMPLOYER)
   * ============================ */
  async userList(req, res) {
    try {
      const userId = req.user.userId;
      const role = req.user.role.toUpperCase();
      const employer = await Employer.findOne({ userId });
      if (!employer)
        return res.status(404).json({ message: 'Employer not found' });

      const employerId = employer._id.toString();
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {
        $or: [
          { recipientId: null },
          { recipientId: 'ALL' },
          { recipientId: employerId },
        ],
        recipientRole: role,
      };

      const totalItems = await Notification.countDocuments(filter);

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy danh sách đã đọc
      const readStates = await NotificationRead.find({
        userId,
        notificationId: { $in: notifications.map((n) => n._id) },
      });

      const readMap = new Set(readStates.map((r) => String(r.notificationId)));

      const items = notifications.map((n) => ({
        ...n.toObject(),
        isRead: readMap.has(String(n._id)),
      }));

      return res.json({
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /** ============================
   *  GET DETAIL
   * ============================ */
  async getById(req, res) {
    const item = await Notification.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  },

  /** ============================
   *  MARK AS READ
   * ============================ */
  async markRead(req, res) {
    const userId = req.user.userId;
    const notiId = req.params.id;

    await NotificationRead.updateOne(
      { userId, notificationId: notiId },
      { readAt: new Date() },
      { upsert: true },
    );

    res.json({ success: true });
  },
};
export const getEmployerNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // lấy từ token
    const role = req.user.role.toUpperCase(); // EMPLOYER
    console.log('User ID:', userId);
    console.log('Role:', role);
    const employer = await Employer.findOne({ userId });
    if (!employer)
      return res.status(404).json({ message: 'Employer not found' });

    const employerId = employer._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lọc notification cho user này
    const filter = {
      recipientRole: role,
      recipientId: employerId, // gửi riêng cho user này
    };

    // Lấy tổng
    const totalItems = await Notification.countDocuments(filter);

    // Lấy danh sách
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Lấy trạng thái đã đọc
    const readStates = await NotificationRead.find({
      userId,
      notificationId: { $in: notifications.map((n) => n._id) },
    });

    const readSet = new Set(readStates.map((r) => String(r.notificationId)));

    const items = notifications.map((n) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      recipientId: n.recipientId,
      recipientRole: n.recipientRole,
      sentAt: n.createdAt,
      isRead: readSet.has(String(n._id)),
    }));

    return res.json({
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      items,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
