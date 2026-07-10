/**
 * aiRecommendController.js
 *
 * Node.js chỉ làm gateway: nhận request từ Frontend → forward sang Python AI service
 * → trả kết quả về. Không xử lý logic AI ở đây.
 */

import axios from 'axios';

const AI_CV_SERVICE_URL =
  process.env.AI_CV_SERVICE_URL || 'http://localhost:8002';

export async function getRecommendations(req, res) {
  const { jobDescription, topK = 5, employerId } = req.body;

  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({
      success: false,
      message: 'jobDescription phải có ít nhất 20 ký tự',
    });
  }

  try {
    const { data } = await axios.post(
      `${AI_CV_SERVICE_URL}/recommend`,
      { jobDescription, topK, employerId },
      { timeout: 60_000 }, // embedding + reason generation có thể mất ~30s lần đầu
    );

    return res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.detail || err.message || 'AI service error';
    return res.status(status).json({ success: false, message });
  }
}
