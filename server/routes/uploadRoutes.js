const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const toDataUrl = (buffer, mimetype) =>
  `data:${mimetype};base64,${buffer.toString("base64")}`;

const saveResume = async (userId, resumeValue) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.resume = resumeValue;
  await user.save();
  return user;
};

router.post("/", protect, upload.single("resume"), async (req, res) => {
  try {
    if (req.body.resumeUrl) {
      const resumeUrl = req.body.resumeUrl.trim();

      if (!resumeUrl) {
        return res.status(400).json({ message: "Resume URL cannot be empty" });
      }

      await saveResume(req.user._id, resumeUrl);

      return res.json({
        message: "Resume link saved successfully",
        url: resumeUrl,
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or resume URL provided" });
    }

    const base64String = toDataUrl(req.file.buffer, req.file.mimetype);
    await saveResume(req.user._id, base64String);

    res.json({
      message: "Resume uploaded successfully",
      url: base64String,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert to Base64
    const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const user = await User.findById(req.user._id);
    if (user) {
      user.avatar = base64String;
      await user.save();
    }

    res.json({
      message: "Avatar uploaded successfully",
      url: base64String,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
