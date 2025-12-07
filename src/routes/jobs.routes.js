import express from 'express';
import Job from '../models/jobs.model.js';
import * as controller from '../controllers/jobs.controller.js';
import { validateJob } from '../middlewares/job.validateJob.js';
import Location from '../models/location.model.js';

const router = express.Router();

router.post('/create', validateJob, controller.createJob);
router.get('/getHistoryEmployer', controller.getAllJobsHistory);
router.put('/edit/:id', controller.updateJob);
router.post('/:id/pause', controller.pauseJob);
router.post('/:id/resume', controller.resumeJob);

// GET /api/jobs/:id → xem chi tiết job
router.get('/edit/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('location');

    if (!job) return res.status(404).json({ message: 'Not found' });

    // Location handling...
    let province = '',
      district = '',
      ward = '';
    if (job.location) {
      const loc = job.location;
      switch (loc.type) {
        case 'province':
          province = loc.code;
          break;
        case 'district':
          district = loc.code;
          province = loc.parent_code || '';
          break;
        case 'ward':
          ward = loc.code;
          const districtDoc = await Location.findOne({ code: loc.parent_code });
          district = districtDoc?.code || '';
          province = districtDoc?.parent_code || '';
          break;
      }
    }

    res.json({
      ...job.toObject(),
      province,
      district,
      ward,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request publish
router.post('/request-publish', async (req, res) => {
  const { jobId } = req.body;
  try {
    const job = await Job.findById(jobId);
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: 'Job không tồn tại' });

    if (job.publishStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể yêu cầu hiển thị từ nháp',
      });
    }

    job.publishStatus = 'pending';
    await job.save();

    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/jobs/:id → xem chi tiết job (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('location')
      // .populate('skills')
      .populate('group_id');

    if (!job) return res.status(404).json({ message: 'Not found' });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
