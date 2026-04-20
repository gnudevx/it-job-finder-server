import Jobs from '../models/jobs.model.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';

export const recommendJobsService = async (jobId) => {
  const currentJob = await Jobs.findById(jobId).lean();

  if (!currentJob) {
    throw new Error('Job not found');
  }

  if (!currentJob.embedding || currentJob.embedding.length === 0) {
    return [];
  }

  const jobs = await Jobs.find({
    _id: { $ne: jobId },
    publishStatus: 'approved',
    visibility: 'visible',
    embedding: { $exists: true, $ne: [] },
  })
    .select('title salary_raw location embedding')
    .populate('location', 'name')
    .limit(300)
    .lean();

  const scored = [];

  // Tính độ tương đồng giữa công việc hiện tại và các công việc khác
  for (const job of jobs) {
    if (!job.embedding) continue;

    if (job.embedding.length !== currentJob.embedding.length) continue;

    let sim = 0;

    try {
      sim = cosineSimilarity(currentJob.embedding, job.embedding);
    } catch (err) {
      console.error(`Error calculating similarity for job ${job._id}:`, err);
      continue;
    }

    // Chỉ thêm vào danh sách nếu độ tương đồng là một số hợp lệ
    if (!isNaN(sim)) {
      scored.push({
        _id: job._id,
        title: job.title,
        salary_raw: job.salary_raw,
        location: job.location?.name,
        similarity: sim,
      });
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, 5);
};
