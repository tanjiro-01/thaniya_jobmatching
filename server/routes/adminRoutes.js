const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllJobs,
  getAllApplications,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Protect all admin routes - only admins can access
router.use(protect, authorize("admin"));

// Users routes
router.route("/users").get(getAllUsers);

router.route("/users/:id").get(getUserById).put(updateUser).delete(deleteUser);

// Jobs routes
router.route("/jobs").get(getAllJobs);

// Applications routes
router.route("/applications").get(getAllApplications);

// Stats route
router.route("/stats").get(getDashboardStats);

module.exports = router;
