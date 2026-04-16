const express = require("express");
const {
  getApplicants,
  getApplicantStats,
  getApplicantById,
  getApplicantByTelegramId,
  updateApplicant,
  setInterest,
  assignSchedule,
  sendPaymentRequest,
  approvePayment
} = require("../controllers/applicantController");

const router = express.Router();

router.get("/", getApplicants);
router.get("/stats", getApplicantStats);
router.get("/telegram/:telegramId", getApplicantByTelegramId);
router.get("/:id", getApplicantById);
router.patch("/:id", updateApplicant);
router.patch("/:id/set-interest", setInterest);
router.patch("/:id/assign-schedule", assignSchedule);
router.post("/:id/send-payment-request", sendPaymentRequest);
router.post("/:id/approve-payment", approvePayment);

module.exports = router;
