const express = require("express");
const { getFinancialSummary, getRevenueStats, getConversionStats } = require("../controllers/analyticsController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth, requireRole("super_admin"));

router.get("/financial-summary", getFinancialSummary);
router.get("/revenue", getRevenueStats);
router.get("/conversions", getConversionStats);

module.exports = router;
