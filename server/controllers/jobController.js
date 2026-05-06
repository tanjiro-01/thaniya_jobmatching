const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Application = require('../models/Application');

// @desc    Get all jobs (with optional search/filter)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    // Auto-seed existing jobs missing experienceLevel
    await Job.updateMany(
      { experienceLevel: { $exists: false } },
      { $set: { experienceLevel: 'fresher' } }
    );

    let query = {};

    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { keywords: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.experience) {
      query.experienceLevel = req.query.experience;
    }

    const jobs = await Job.find(query).populate('recruiter', 'name company');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get jobs created by logged in recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private/Recruiter
const getMyCreatedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name company');
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Recruiter
const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, keywords, experienceLevel } = req.body;

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      keywords,
      experienceLevel,
      recruiter: req.user._id,
    });

    const createdJob = await job.save();
    
    // Notify all candidates about the new job
    const candidates = await User.find({ role: 'candidate' });
    const notifications = candidates.map(candidate => ({
      recipient: candidate._id,
      message: `New job posted: ${title} at ${company}`,
      type: 'new_job',
      relatedJob: createdJob._id
    }));
    
    // Also send a confirmation to the recruiter
    notifications.push({
      recipient: req.user._id,
      message: `Successfully posted your new job: ${title}`,
      type: 'new_job',
      relatedJob: createdJob._id
    });
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter
const updateJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, keywords } = req.body;

    const job = await Job.findById(req.params.id);

    if (job) {
      // Check if user is the recruiter who created the job or an admin
      if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this job' });
      }

      job.title = title || job.title;
      job.description = description || job.description;
      job.company = company || job.company;
      job.location = location || job.location;
      job.salary = salary || job.salary;
      job.keywords = keywords || job.keywords;

      const updatedJob = await job.save();
      
      // Notify candidates who have applied for this job
      const applications = await Application.find({ job: job._id }).populate('candidate');
      const notifications = applications.map(app => ({
        recipient: app.candidate._id,
        message: `The job "${job.title}" you applied for has been updated.`,
        type: 'job_update',
        relatedJob: job._id
      }));
      
      // Also send a confirmation to the recruiter
      notifications.push({
        recipient: req.user._id,
        message: `Successfully updated your job posting: ${job.title}`,
        type: 'job_update',
        relatedJob: job._id
      });
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Recruiter or Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this job' });
      }

      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getMyCreatedJobs, getJobById, createJob, updateJob, deleteJob };
