import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

export const getMessages = async (conversationId) => {
  return Message.find({ conversationId }).sort({ createdAt: 1 });
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

  // update conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    lastMessageTime: new Date(),
  });

  return msg;
};
