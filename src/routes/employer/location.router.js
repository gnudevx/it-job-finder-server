import express from 'express';
import Location from '../../models/location.model.js';

const router = express.Router();

// GET provinces
router.get('/provinces', async (req, res) => {
  const data = await Location.find({ type: 'province' }).sort({ name: 1 });
  res.json(data);
});

// GET districts
router.get('/districts/:provinceCode', async (req, res) => {
  const data = await Location.find({
    type: 'district',
    parent_code: req.params.provinceCode,
  }).sort({ name: 1 });

  res.json(data);
});

// GET wards
router.get('/wards/:districtCode', async (req, res) => {
  const data = await Location.find({
    type: 'ward',
    parent_code: req.params.districtCode,
  }).sort({ name: 1 });

  res.json(data);
});

export default router;
