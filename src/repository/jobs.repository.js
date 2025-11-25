import Job from '../models/jobs.model.js';

export const createJob = async (data) => {
  return Job.create(data);
};
