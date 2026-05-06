const Job = require('../models/Job');

// @desc    Get all jobs (with optional search/filter)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
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

    // Since we don't have a rigid experience field in the model currently,
    // we could filter by title or description optionally, or if we had an experience field, use it.
    // For now, if experience is passed, we'll try to find it in the description as a basic filter.
    if (req.query.experience) {
      // Basic implementation for experience filtering
      if (!query.$or) query.$or = [];
      query.$or.push({ description: { $regex: req.query.experience, $options: 'i' } });
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
    const { title, description, company, location, salary, keywords } = req.body;

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      keywords,
      recruiter: req.user._id,
    });

    const createdJob = await job.save();
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
