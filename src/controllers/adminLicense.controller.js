import adminLicenseService from '../services/adminLicense.service.js';

class AdminLicenseController {
  async getPending(req, res) {
    try {
      const employers = await adminLicenseService.getPendingLicenses();
      return res.json({ success: true, employers });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getHistory(req, res) {
    try {
      const history = await adminLicenseService.getLicenseHistory();
      return res.json({ success: true, history });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async review(req, res) {
    try {
      const employerId = req.params.id;
      const { status } = req.body;
      const adminId = req.user.userId; // từ JWT

      const updated = await adminLicenseService.reviewLicense(
        employerId,
        status,
        adminId,
      );

      return res.json({ success: true, employer: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

export default new AdminLicenseController();
