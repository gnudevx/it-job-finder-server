// routes/specialization.js
import express from 'express';
const router = express.Router();

import Specialization from '../../models/specialization.model.js';

// GET /api/specializations
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả dữ liệu, chỉ lấy các trường cần thiết để nhẹ payload
    const specs = await Specialization.find(
      {},
      { code: 1, name: 1, domains: 1 },
    );
    res.json({ data: specs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
