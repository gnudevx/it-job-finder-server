import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

const COLLECTION_NAME = 'jobs';

// Hàm random deadline
function getRandomDeadline() {
  const start = new Date('2025-12-01T00:00:00Z').getTime();
  const end = new Date('2025-12-31T23:59:59Z').getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

// Schema tạm để update
const JobSchema = new mongoose.Schema({}, { strict: false });
const Job = mongoose.model(COLLECTION_NAME, JobSchema, COLLECTION_NAME);

// MAIN
async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const jobs = await Job.find({});
    console.log(`➡ Found ${jobs.length} jobs`);

    for (const job of jobs) {
      const newDeadline = getRandomDeadline();

      await Job.updateOne(
        { _id: job._id },
        { $set: { deadline: newDeadline } },
      );

      console.log(`✔ Updated ${job.title} → ${newDeadline}`);
    }

    console.log('🎉 Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
