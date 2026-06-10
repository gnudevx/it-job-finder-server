/**
 * backfillResumes.js
 * Chạy: node src/scripts/backfillResumes.js
 * "backfill": "node src/scripts/backfillResumes.js"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resume from '../models/resumes.model.js';
import ParsedResume from '../models/ParsedResumeSchema.module.js';
import { parseAndSaveResume } from '../services/parseResume.service.js';
import { triggerEmbedCV } from '../services/ai/embedTrigger.js';

dotenv.config();

const BATCH_SIZE = 5;
const DELAY_MS = 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  log('✅ MongoDB connected');

  // Lấy TẤT CẢ resume — kể cả jdEmbedding = [] vì chưa embed thật
  const allResumes = await Resume.find({}, { _id: 1, jdEmbedding: 1 }).lean();
  log(`📂 Tổng số CV trong DB: ${allResumes.length}`);

  // Lọc đúng: jdEmbedding rỗng HOẶC phần tử đầu không phải số (chưa embed thật)
  const needsEmbed = allResumes.filter(
    (r) =>
      !r.jdEmbedding ||
      r.jdEmbedding.length === 0 ||
      typeof r.jdEmbedding[0] !== 'number',
  );
  log(`⚠️  CV cần embed: ${needsEmbed.length}`);
  log(`✅ CV đã có embedding thật: ${allResumes.length - needsEmbed.length}`);

  if (needsEmbed.length === 0) {
    log('Không cần backfill.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Kiểm tra Python service trước khi chạy
  try {
    const { default: axios } = await import('axios');
    await axios.get(
      `${process.env.AI_CV_SERVICE_URL || 'http://localhost:8002'}/health`,
      { timeout: 3000 },
    );
    log('✅ Python AI service đang chạy');
  } catch {
    log(
      '❌ Python AI service chưa chạy tại port 8002 — hãy docker compose up trước',
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < needsEmbed.length; i += BATCH_SIZE) {
    const batch = needsEmbed.slice(i, i + BATCH_SIZE);
    log(`\n🔄 Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${batch.length} CV`);

    // Xử lý tuần tự trong batch để dễ debug và tránh rate limit
    for (const resume of batch) {
      const resumeId = resume._id.toString();
      try {
        const parsed = await ParsedResume.findOne({ resumeId: resume._id });

        if (!parsed) {
          log(`  📄 Parse + embed: ${resumeId}`);
          // parseAndSaveResume gọi triggerEmbedCV fire&forget bên trong
          // nên ở đây ta gọi triggerEmbedCV thêm 1 lần sau để chắc chắn
          await parseAndSaveResume(resume._id);
          // Chờ thêm để parse service kịp lưu ParsedResume trước khi embed
          await sleep(500);
          await triggerEmbedCV(resumeId); // ← await thật sự, không fire&forget
        } else if (!parsed.shortSummary && !parsed.summary) {
          log(`  ⚠️  Bỏ qua (không có summary): ${resumeId}`);
          failed++;
          errors.push({ resumeId, reason: 'no summary' });
          continue;
        } else {
          log(`  🧠 Embed: ${resumeId}`);
          await triggerEmbedCV(resumeId); // ← await thật sự
        }

        log(`  ✅ Done: ${resumeId}`);
        success++;
      } catch (err) {
        log(`  ❌ Thất bại: ${resumeId} — ${err.message}`);
        failed++;
        errors.push({ resumeId, reason: err.message });
      }
    }

    if (i + BATCH_SIZE < needsEmbed.length) {
      log(`  ⏳ Chờ ${DELAY_MS}ms...`);
      await sleep(DELAY_MS);
    }
  }

  log('\n═══════════════════════════════════════');
  log(`✅ Thành công : ${success}`);
  log(`❌ Thất bại  : ${failed}`);
  if (errors.length > 0) {
    log('Danh sách lỗi:');
    errors.forEach(({ resumeId, reason }) => log(`  - ${resumeId}: ${reason}`));
  }
  log('═══════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

backfill().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
