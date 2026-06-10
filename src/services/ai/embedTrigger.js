/**
 * embedTrigger.js
 *
 * Node.js gọi Python AI service để embed 1 CV sau khi parse xong.
 * Fire & forget — caller không cần await.
 */

import axios from 'axios';

const AI_CV_SERVICE_URL =
  process.env.AI_CV_SERVICE_URL || 'http://localhost:8002';

/**
 * Trigger Python service embed CV.
 * @param {string} resumeId - MongoDB ObjectId string
 */
export async function triggerEmbedCV(resumeId) {
  await axios.post(
    `${AI_CV_SERVICE_URL}/embed`,
    { resumeId },
    { timeout: 30_000 },
  );
}
