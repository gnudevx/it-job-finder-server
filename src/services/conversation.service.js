import mongoose from 'mongoose';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import Application from '../models/applications.model.js';
import Job from '../models/jobs.model.js';

export const getOrCreateConversation = async ({
  employerId,
  candidateId,
  jobId,
}) => {
  let convo = await Conversation.findOne({
    employerId,
    candidateId,
    jobId,
  });

  if (!convo) {
    convo = await Conversation.create({
      employerId,
      candidateId,
      jobId,
    });
  }

  return convo;
};

export const getConversationsByEmployer = async (employerId) => {
  const conversations = await Conversation.find({ employerId })
    .populate('candidateId', 'fullName avatar')
    .populate({
      path: 'jobId',
      select: 'title',
    })
    .sort({ updatedAt: -1 });

  const results = await Promise.all(
    conversations.map(async (c) => {
      const lastMsg = await Message.find({ conversationId: c._id })
        .sort({ createdAt: -1 })
        .limit(1); // chỉ lấy tin nhắn cuối cùng
      if (!lastMsg.length) return null;

      return {
        id: c.candidateId._id,
        name: c.candidateId.fullName,
        avatar: c.candidateId.avatar,
        position: c.jobId?.title,
        lastMessage: lastMsg[0]?.text || '',
        lastMessageTime: lastMsg[0]?.createdAt || c.updatedAt,
        unreadCount: c.unreadCount || {
          employer: 0,
          candidate: 0,
        },
        conversationId: c._id,
      };
    }),
  );

  return results.filter(Boolean);
};

export const getApplicationsByCandidate = async (candidateId) => {
  const applications = await Application.find({ candidateId })
    .populate({
      path: 'jobId',
      select: 'title employer_id',
      populate: {
        path: 'employer_id',
        select: 'avatar companyId',
        populate: {
          path: 'companyId',
          select: 'name logo',
        },
      },
    })
    .sort({ appliedAt: -1 });

  return applications.map((app) => ({
    id: app.jobId.employer_id._id,
    name: app.jobId.employer_id.companyId?.name || 'Unknown Company',
    avatar:
      app.jobId.employer_id.companyId?.logo || app.jobId.employer_id.avatar,
    position: app.jobId.title,
    jobId: app.jobId._id, // 🔥 QUAN TRỌNG (để tạo conversation)
  }));
};

export const getConversationsByCandidate = async (candidateId) => {
  const conversations = await Conversation.find({ candidateId })
    .populate({
      path: 'employerId',
      select: 'avatar companyId',
      populate: {
        path: 'companyId',
        select: 'name logo',
      },
    })
    .populate({
      path: 'jobId',
      select: 'title',
    })
    .sort({ updatedAt: -1 });
  const results = await Promise.all(
    conversations.map(async (c) => {
      if (!c.employerId) return null;

      const lastMsg = await Message.find({ conversationId: c._id })
        .sort({ createdAt: -1 })
        .limit(1);

      if (!lastMsg.length) return null;

      return {
        position: c.jobId?.title,
        id: c.employerId?._id,
        name: c.employerId?.companyId?.name || 'Unknown Company',
        avatar: c.employerId?.companyId?.logo || c.employerId?.avatar,
        lastMessage: lastMsg[0]?.text || '',
        lastMessageTime: lastMsg[0]?.createdAt || c.updatedAt,
        unreadCount: c.unreadCount || {
          employer: 0,
          candidate: 0,
        },
        conversationId: c._id,
      };
    }),
  );
  return results.filter(Boolean);
};
export const getApplicationsByEmployer = async (employerId) => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const employerObjectId = new mongoose.Types.ObjectId(employerId);

  // 1. Lấy job
  const jobs = await Job.find({
    employer_id: employerObjectId,
  }).select('_id title');

  const jobMap = {};
  jobs.forEach((job) => {
    jobMap[job._id.toString()] = job.title;
  });

  const jobIds = jobs.map((j) => j._id);
  if (!jobIds.length) return [];

  // 2. Lấy application + candidate
  const applications = await Application.find({
    jobId: { $in: jobIds },
    appliedAt: { $gte: last7Days },
  })
    .populate('candidateId', 'candidateId fullName avatar') // 👈 chỉ lấy 2 field
    .select('jobId appliedAt candidateId')
    .sort({ appliedAt: -1 });

  // 3. Format lại data
  const result = applications.map((app) => {
    const now = new Date();
    const diffMs = now - new Date(app.appliedAt);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    let timeAgo = '';
    if (diffHours < 1) {
      timeAgo = 'Vừa xong';
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} giờ trước`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      timeAgo = `${diffDays} ngày trước`;
    }

    return {
      position: jobMap[app.jobId.toString()],
      appliedAt: timeAgo,
      jobId: app.jobId,
      candidate: {
        candidateId: app.candidateId?._id,
        fullName: app.candidateId?.fullName,
        avatar: app.candidateId?.avatar,
      },
    };
  });

  return result;
};
