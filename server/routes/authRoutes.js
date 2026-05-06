const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
