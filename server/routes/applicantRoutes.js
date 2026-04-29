const express = require("express");
const {
  getApplicants, getApplicantStats, getApplicantById, getApplicantByTelegramId,
  getApplicantActivity, updateApplicant, setInterest, assignSchedule,
  sendPaymentRequest, approvePayment, rejectPayment, declineApprovedPayment,
  requestFullPayment, getReceipt
} = require("../controllers/applicantController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/telegram/:telegramId", getApplicantByTelegramId);
router.use(requireAuth, requireRole("admin", "super_admin"));

router.get("/", getApplicants);
router.get("/stats", getApplicantStats);
router.get("/:id", getApplicantById);
router.get("/:id/activity", getApplicantActivity);
router.get("/:id/receipt", getReceipt);
router.patch("/:id", updateApplicant);
router.patch("/:id/set-interest", setInterest);
router.patch("/:id/assign-schedule", assignSchedule);
router.post("/:id/send-payment-request", sendPaymentRequest);
router.post("/:id/approve-payment", approvePayment);
router.post("/:id/reject-payment", rejectPayment);
router.post("/:id/request-full-payment", requestFullPayment);
// Decline an already-approved payment (super_admin only)
router.post("/:id/decline-approved-payment", requireRole("super_admin"), declineApprovedPayment);

module.exports = router;
