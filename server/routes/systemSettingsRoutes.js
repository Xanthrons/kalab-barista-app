const express = require("express");
const {
  getSystemSettings,
  updateSystemSettings
} = require("../controllers/systemSettingsController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("super_admin"));

router.get("/", getSystemSettings);
router.patch("/", updateSystemSettings);

module.exports = router;
