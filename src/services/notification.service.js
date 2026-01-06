import Notification from '../models/notification.model.js';

export const NotificationService = {
  async create(data) {
    const n = new Notification(data);
    await n.save();
    return n.toObject();
  },

  async getById(id) {
    return Notification.findById(id).lean();
  },

  async adminList({
    page = 1,
    limit = 10,
    q,
    type,
    role,
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = {}) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (q)
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { message: new RegExp(q, 'i') },
      ];
    if (type) filter.type = type;
    if (role) filter.recipientRole = role;

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ [sortBy]: sortDir === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);
    return {
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async userList({ userId, role, page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const filter = {
      recipientRole: role,
      $or: [{ recipientId: 'ALL' }, { recipientId: userId }],
    };
    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    // add isRead flag
    const data = items.map((n) => {
      const isRead =
        Array.isArray(n.readBy) && n.readBy.some((r) => r.userId === userId);
      return { ...n, isRead };
    });

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async markRead(notificationId, userId) {
    const n = await Notification.findById(notificationId);
    if (!n) throw new Error('Notification not found');
    if (!n.readBy.some((r) => r.userId === userId)) {
      n.readBy.push({ userId, readAt: new Date() });
      await n.save();
    }
    return n.toObject();
  },
};
