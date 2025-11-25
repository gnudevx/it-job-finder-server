import express from 'express';
import Job from '../models/jobs.model.js';
import * as controller from '../controllers/jobs.controller.js';
import { validateJob } from '../middlewares/job.validateJob.js';
const router = express.Router();

router.post('/create', validateJob, controller.createJob);

// GET /api/jobs  → lấy danh sách jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('location')
      .populate('skills')
      .populate('group_id');

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id → xem chi tiết job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('location')
      .populate('skills')
      .populate('group_id');

    if (!job) return res.status(404).json({ message: 'Not found' });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
