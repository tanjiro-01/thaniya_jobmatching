const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private/Candidate
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: req.params.jobId,
      candidate: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      job: req.params.jobId,
      candidate: req.user._id,
      resume: req.user.resume || '' // Optional, can be updated later with Cloudinary
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for a recruiter's jobs
// @route   GET /api/applications/recruiter
// @access  Private/Recruiter
const getRecruiterApplications = async (req, res) => {
  try {
    // Find jobs created by this recruiter
    const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
    const jobIds = jobs.map(job => job._id);

    // Find applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('candidate', 'name email resume skills')
      .populate('job', 'title location company');
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get candidate's own applications
// @route   GET /api/applications/my
// @access  Private/Candidate
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title location company');
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Recruiter
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the user updating the status is the recruiter who created the job
    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob,
  getRecruiterApplications,
  getMyApplications,
  updateApplicationStatus
};
