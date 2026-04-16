const express = require("express");
const { getStudentStatus, updateStudentProfile } = require("../controllers/studentController");

const router = express.Router();

// Get student status by Telegram ID
router.get("/status/:telegramId", getStudentStatus);

// Update student profile
router.patch("/profile/:id", updateStudentProfile);

module.exports = router;