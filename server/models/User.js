const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  resume: {
    type: String // URL from Cloudinary
  },
  skills: [{
    type: String
  }],
  company: {
    type: String // for recruiters
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', '']
  },
  experienceYears: {
    type: Number
  },
  education: {
    type: String
  },
  location: {
    type: String
  },
  phone: {
    type: String
  },
  avatar: {
    type: String
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
