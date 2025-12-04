// controllers/application.controller.js
import {
  getApplicationsByEmployer,
  updateApplicationStatusService,
} from '../services/application.service.js';
import Employer from '../models/employer.model.js';

export const getAppliedByEmployer = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Kiểm tra employer
    const employer = await Employer.findOne({ userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Lấy danh sách đơn apply
    const applications = await getApplicationsByEmployer(employer._id);

    return res.status(200).json({
      success: true,
      total: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const userId = req.user?.userId || req.user?.id;

    const result = await updateApplicationStatusService(
      applicationId,
      status,
      userId,
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
