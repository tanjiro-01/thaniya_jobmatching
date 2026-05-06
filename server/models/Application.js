const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'accepted'],
    default: 'applied'
  },
  resume: {
    type: String // Snapshot of resume URL at the time of application
  },
  coverLetter: {
    type: String
  },
  contactPhone: {
    type: String
  },
  contactEmail: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
