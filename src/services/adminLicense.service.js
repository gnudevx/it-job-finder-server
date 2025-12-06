import Employer from '../models/employer.model.js';

class AdminLicenseService {
  // Lấy danh sách license đang chờ duyệt
  async getPendingLicenses() {
    const employers = await Employer.find({ 'license.status': 'pending' })
      .populate('userId', 'email')
      .populate('companyId', 'name');

    return employers.map((e) => ({
      id: e._id,
      companyName: e.companyId?.name || '',
      fullName: e.fullName,
      email: e.userId?.email || '',
      licenseDocUrl: e.license.fileUrl,
      licenseStatus: e.license.status,
    }));
  }

  // Lấy lịch sử license đã review
  async getLicenseHistory() {
    const employers = await Employer.find({
      'license.status': { $in: ['approved', 'rejected'] },
    })
      .populate('userId', 'email')
      .populate('companyId', 'name');

    return employers.map((e) => ({
      id: e._id,
      companyName: e.companyId?.name || '',
      fullName: e.fullName,
      email: e.userId?.email || '',
      licenseDocUrl: e.license.fileUrl,
      licenseStatus: e.license.status,
      reviewedAt: e.license.reviewedAt,
      reviewedBy: e.license.reviewedBy,
    }));
  }

  // Duyệt license
  async reviewLicense(employerId, status, adminId) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Invalid license status');
    }

    const updated = await Employer.findByIdAndUpdate(
      employerId,
      {
        $set: {
          'license.status': status,
          'license.reviewedAt': new Date(),
          'license.reviewedBy': adminId,
        },
      },
      { new: true },
    )
      .populate('userId', 'email')
      .populate('companyId', 'name');

    if (!updated) throw new Error('Employer not found');

    return {
      id: updated._id,
      companyName: updated.companyId?.name || '',
      fullName: updated.fullName,
      email: updated.userId?.email || '',
      licenseDocUrl: updated.license.fileUrl,
      licenseStatus: updated.license.status,
      reviewedAt: updated.license.reviewedAt,
      reviewedBy: updated.license.reviewedBy,
    };
  }
}

export default new AdminLicenseService();
