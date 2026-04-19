import {
  getMessages,
  sendMessage,
  markConversationAsRead,
} from '../services/message.service.js';

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId, cursor } = req.query;

    const messages = await getMessages(conversationId, cursor);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessageController = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const senderRole = req.user.role;

    const { conversationId, text } = req.body;

    const msg = await sendMessage({
      conversationId,
      senderId,
      senderRole,
      text,
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const markAsRead = async (req, res) => {
  try {
    const { conversationId, role } = req.body;

    await markConversationAsRead(conversationId, role);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
