const mongoose = require('mongoose');
const Job = require('./models/Job');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const jobs = await Job.find({ experienceLevel: { $exists: false } });
  console.log(`Found ${jobs.length} jobs without experienceLevel`);

  for (let job of jobs) {
    job.experienceLevel = 'fresher'; // just default to fresher for testing
    await job.save();
  }

  console.log('Updated existing jobs.');
  process.exit();
}

seed();
