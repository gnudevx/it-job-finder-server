import mongoose from 'mongoose';

import JobsGroup from './models/jobsGroup.model.js';

import Job from './models/jobs.model.js';
import JobGroup from './models/jobGroup.model.js';
import Location from './models/location.model.js';
import Skill from './models/skill.model.js';

// KẾT NỐI DB
await mongoose.connect('mongodb://localhost:27017/ITJOBS');
console.log('Connected to DB');

// ===== BẮT ĐẦU MIGRATION =====
const groups = await JobsGroup.find({});
console.log('Groups found:', groups.length);

for (const g of groups) {
  console.log(`\n=== MIGRATING GROUP: ${g.group} ===`);

  // 1. Tạo JobGroup mới
  const groupDoc = await JobGroup.findOneAndUpdate(
    { name: g.group },
    { name: g.group },
    { upsert: true, new: true },
  );

  // 2. Duyệt từng job trong group
  for (const job of g.jobs) {
    console.log('Migrating job:', job.title);

    // ---- Location ----
    const locationDoc = await Location.findOneAndUpdate(
      { name: job.location },
      { name: job.location },
      { upsert: true, new: true },
    );

    // ---- Skills ----
    const skillIds = [];
    if (job.skills && job.skills.length > 0) {
      for (const s of job.skills) {
        const skillDoc = await Skill.findOneAndUpdate(
          { name: s },
          { name: s },
          { upsert: true, new: true },
        );
        skillIds.push(skillDoc._id);
      }
    }

    // ---- Convert fields ----
    await Job.create({
      title: job.title,
      link: job.link,
      location: locationDoc._id,
      experience: String(job.experience),
      description: job.description,
      requirements: job.requirements?.split('\n') ?? [],
      benefits: job.benefits?.split('\n') ?? [],
      work_location_detail: job.work_location_detail,
      working_time: job.working_time,
      deadline: job.deadline ? new Date(job.deadline) : null,
      salary_raw: job.salary_raw,
      salary_normalized: job.salary_normalized,
      currency_unit: job.currency_unit,
      skills: skillIds,
      group_id: groupDoc._id,
      employer_id: null,
    });
  }
}

console.log('\n=== MIGRATION DONE ===');
process.exit();
