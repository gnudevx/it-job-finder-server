// services/application.service.js
import Application from '../models/applications.model.js';
import Jobs from '../models/jobs.model.js';
import Employer from '../models/employer.model.js';

export const getApplicationsByEmployer = async (employerId, filters = {}) => {
  const { q, campaign, status, range, appliedAt, toDate } = filters;

  const jobs = await Jobs.find({ employer_id: employerId }).select('_id');
  if (!jobs.length) return [];

  const jobIds = jobs.map((job) => job._id);

  // ⭐ BUILD QUERY
  let query = {
    jobId: { $in: jobIds },
  };

  // Search theo ứng viên hoặc job title
  if (q) {
    query.$or = [
      { 'candidateId.fullName': { $regex: q, $options: 'i' } },
      { 'jobId.title': { $regex: q, $options: 'i' } },
    ];
  }

  // Filter campaign
  if (campaign) query.jobId = campaign;

  // ⭐ FILTER STATUS (bạn đang thiếu)
  if (status) query.status = status;

  // TIME RANGE
  if (range && range !== 'custom') {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        query.appliedAt = { $gte: start };
        break;

      case '7days':
        start = new Date();
        start.setDate(start.getDate() - 7);
        query.appliedAt = { $gte: start };
        break;

      case '30days':
        start = new Date();
        start.setDate(start.getDate() - 30);
        query.appliedAt = { $gte: start };
        break;

      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        query.appliedAt = { $gte: start };
        break;

      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 1);
        query.appliedAt = { $gte: start, $lt: end };
        break;
    }
  }

  if (range === 'custom' && appliedAt && toDate) {
    query.appliedAt = {
      $gte: new Date(appliedAt),
      $lte: new Date(toDate + 'T23:59:59'),
    };
  }

  const applications = await Application.find(query)
    .populate({
      path: 'jobId',
      populate: [
        { path: 'location', model: 'Location', strictPopulate: false },
        { path: 'group_id', model: 'JobGroup', strictPopulate: false },
      ],
    })
    .populate({
      path: 'candidateId',
      model: 'Candidate',
      populate: { path: 'userId', model: 'USER' },
    })
    .populate({
      path: 'resumeId',
      model: 'Resume',
      strictPopulate: false,
    })
    .sort({ appliedAt: -1 });

  return applications;
};

export const updateApplicationStatusService = async (
  applicationId,
  status,
  userId,
) => {
  // 1. Kiểm tra employer
  const employer = await Employer.findOne({ userId });
  if (!employer) {
    return { success: false, statusCode: 404, message: 'Employer not found' };
  }

  // 2. Kiểm tra application
  const application = await Application.findById(applicationId);
  if (!application) {
    return {
      success: false,
      statusCode: 404,
      message: 'Application not found',
    };
  }

  // 3. kiểm tra job thuộc employer
  const job = await Jobs.findById(application.jobId);
  if (!job || job.employer_id.toString() !== employer._id.toString()) {
    return { success: false, statusCode: 403, message: 'Not allowed' };
  }

  // 4. Validate status
  const validStatus = [
    'applied',
    'reviewed',
    'interviewing',
    'rejected',
    'hired',
  ];
  if (!validStatus.includes(status)) {
    return { success: false, statusCode: 400, message: 'Invalid status' };
  }

  // 5. Cập nhật
  application.status = status;
  application.updatedAt = Date.now();
  await application.save();

  return {
    success: true,
    statusCode: 200,
    message: 'Status updated successfully',
    data: application,
  };
};
