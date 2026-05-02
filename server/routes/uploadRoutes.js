const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Update user's resume URL
    const user = await User.findById(req.user._id);
    if (user) {
      user.resume = req.file.path;
      await user.save();
    }

    res.json({
      message: 'Resume uploaded successfully',
      url: req.file.path
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
