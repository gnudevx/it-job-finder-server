import {
  findCompanyByEmployer,
  createCompanyService,
  updateCompanyService,
  getLatestCompanies,
  assignCompanyToEmployer,
  getCompanyByEmployerIdService,
} from '../services/company.service.js';

export const getCompany = async (req, res, next) => {
  try {
    const companies = await getLatestCompanies();
    res.json({ companies });
  } catch (err) {
    next(err);
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
export const getMyCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const company = await findCompanyByEmployer(userId);

    res.json({ company });
  } catch (err) {
    next(err);
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.error('Error get company:', req.user);
    console.log('Error get company:', req.user.userId);
    const data = req.body;

    if (!data.companyName || !data.email || !data.taxCode) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
    }

    const newCompany = await createCompanyService(userId, data);

    return res.json({
      message: 'Tạo công ty thành công!',
      company: newCompany,
    });
  } catch (err) {
    next(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    // Lấy company hiện tại
    const company = await findCompanyByEmployer(userId);

    if (!company) {
      return res.status(404).json({ message: 'Bạn chưa có công ty!' });
    }

    // Cập nhật
    const updated = await updateCompanyService(company._id, data);

    return res.json({
      message: 'Cập nhật công ty thành công!',
      company: updated,
    });
  } catch (err) {
    console.error('Error update company:', err);
    next(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const selectCompany = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: 'Thiếu companyId' });
    }

    const updatedEmployer = await assignCompanyToEmployer(userId, companyId);

    res.json({
      message: 'Cập nhật công ty thành công!',
      employer: updatedEmployer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' }); // gửi lỗi 1 lần
  }
};

export const getCompanyPublicController = async (req, res) => {
  try {
    const { employerId } = req.params;

    const company = await getCompanyByEmployerIdService(employerId);

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
