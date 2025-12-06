import {
  getAllJobsService,
  getJobDetailService,
  updateJobStatusService,
} from '../services/jobs.service.js';

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await getAllJobsService();
    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getJobDetail = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await getJobDetailService(jobId);
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const updatedJob = await updateJobStatusService(jobId, status);
    res.json({ success: true, job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};
