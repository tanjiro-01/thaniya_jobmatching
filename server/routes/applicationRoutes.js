const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getRecruiterApplications,
  getApplicationsByJob,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, authorize('candidate'), applyForJob);
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getApplicationsByJob);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
