const express = require("express");
const {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require("../controllers/scheduleController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("admin", "super_admin"));

router.get("/", getSchedules);
router.post("/", createSchedule);
router.patch("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;
