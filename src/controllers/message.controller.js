import { getMessages, sendMessage } from '../services/message.service.js';

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await getMessages(conversationId);

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
