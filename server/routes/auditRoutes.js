const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth, requireRole("super_admin"));
router.get("/", getAuditLogs);

module.exports = router;
