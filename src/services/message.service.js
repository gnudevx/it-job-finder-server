import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

export const getMessages = async (conversationId, cursor) => {
  const query = { conversationId };

  // 👇 chỉ thêm cursor khi có
  if (cursor) {
    query._id = { $lt: cursor };
  }

  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(20);

  return messages;
};

export const sendMessage = async ({
  conversationId,
  senderId,
  senderRole,
  text,
}) => {
  const msg = await Message.create({
    conversationId,
    senderId,
    senderRole,
    text,
  });

  // 🔥 LẤY conversation ra
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error('Conversation not found');

  // 🔥 update dữ liệu
  conversation.lastMessage = text;
  conversation.lastMessageTime = new Date();

  await conversation.save();

  return msg;
};
export const markConversationAsRead = async (conversationId, role) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error('Conversation not found');

  if (role === 'employer') {
    conversation.unreadCount.employer = 0;
  } else {
    conversation.unreadCount.candidate = 0;
  }

  await conversation.save();

  return conversation;
};
