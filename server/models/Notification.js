const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['application_status', 'new_applicant', 'job_update', 'new_job', 'general'],
    default: 'general'
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
