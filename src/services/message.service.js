import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

export const getMessages = async (conversationId, cursor) => {
  const query = { conversationId };

  // chỉ thêm cursor khi có
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
  type,
  interviewDate,
  interviewTime,
  interviewLink,
  assignmentTitle,
  assignmentDescription,
  assignmentDeadline,
  submissionLink,
  submissionNote,
  assignmentRefId,
}) => {
  const msg = await Message.create({
    conversationId,
    senderId,
    senderRole,
    text,
    type,
    interviewDate,
    interviewTime,
    interviewLink,
    assignmentTitle,
    assignmentDescription,
    assignmentDeadline,
    submissionLink,
    submissionNote,
    assignmentRefId,
  });

  // LẤY conversation ra
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error('Conversation not found');

  // update dữ liệu
  let lastMsgText = text;
  if (type === 'file') {
    lastMsgText = '📎 File';
  } else if (type === 'interview') {
    lastMsgText = '📅 Lịch phỏng vấn';
  } else if (type === 'assignment') {
    lastMsgText = '📝 Test Assignment';
  } else if (type === 'assignment_submit') {
    lastMsgText = '✅ Nộp bài Assignment';
  }

  conversation.lastMessage = lastMsgText || '';
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
