const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Schedule = require("../models/Schedule");
const telegramService = require("../services/telegramService");
const audit = require("../utils/audit");

function buildTelegramLookup(telegramId) {
  const parsedTelegramId = Number(telegramId);
  return { $or: [{ telegram_id: parsedTelegramId }, { "telegram_user.id": parsedTelegramId }] };
}

async function populateApplicant(applicant) {
  if (!applicant) return null;
  return applicant.populate("assigned_schedule");
}

async function notifyClassDetailsIfReady(applicant) {
  const hydrated = await populateApplicant(applicant);
  if (hydrated?.interest_status === "interested" && hydrated?.payment_status === "paid" && hydrated?.assigned_schedule) {
    await telegramService.sendClassDetails(hydrated, hydrated.assigned_schedule);
  }
  return hydrated;
}

async function getApplicants(req, res, next) {
  try {
    const { search = "", payment_status, interest_status, page, limit } = req.query;
    const filter = {};
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, parseInt(limit) || 200);
    const skip = (pageNum - 1) * limitNum;

    if (payment_status && payment_status !== "all") filter.payment_status = payment_status;
    if (interest_status && interest_status !== "all") filter.interest_status = interest_status;
    if (search.trim()) {
      const pattern = new RegExp(search.trim(), "i");
      filter.$or = [
        { "personal_info.first_name": pattern }, { "personal_info.last_name": pattern },
        { "personal_info.email": pattern }, { "personal_info.phone": pattern }, { username: pattern }
      ];
    }

    const [applicants, total] = await Promise.all([
      Registration.find(filter).populate("assigned_schedule").sort({ createdAt: -1 }).skip(skip).limit(limitNum).select("-__v"),
      Registration.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: applicants,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    return next(error);
  }
}

async function getApplicantStats(req, res, next) {
  try {
    const [stats] = await Registration.aggregate([{
      $group: {
        _id: null,
        total: { $sum: 1 },
        paid: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$payment_status", "pending"] }, 1, 0] } },
        interested: { $sum: { $cond: [{ $eq: ["$interest_status", "interested"] }, 1, 0] } },
        schedules_assigned: { $sum: { $cond: [{ $ifNull: ["$assigned_schedule", false] }, 1, 0] } }
      }
    }]);
    return res.status(200).json({ success: true, data: stats || { total:0,paid:0,pending:0,interested:0,schedules_assigned:0 } });
  } catch (error) { return next(error); }
}

async function getApplicantById(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id).populate("assigned_schedule").select("-__v");
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    return res.status(200).json({ success: true, data: applicant });
  } catch (error) { return next(error); }
}

async function getApplicantByTelegramId(req, res, next) {
  try {
    const applicant = await Registration.findOne(buildTelegramLookup(req.params.telegramId)).populate("assigned_schedule").select("-__v");
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    return res.status(200).json({ success: true, data: applicant });
  } catch (error) { return next(error); }
}

async function getApplicantActivity(req, res, next) {
  try {
    const AuditLog = require("../models/AuditLog");
    const logs = await AuditLog.find({ target_type: "applicant", target_id: req.params.id })
      .sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) { return next(error); }
}

async function updateApplicant(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    const updates = req.body || {};
    if (updates.price !== undefined) applicant.price = Number(updates.price) || 0;
    if (updates.reminder_enabled !== undefined) applicant.reminder_enabled = Boolean(updates.reminder_enabled);
    if (updates.payment_status !== undefined) applicant.payment_status = updates.payment_status;
    await applicant.save();
    await audit.log({ req, action: "applicant.update", description: `Updated applicant ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name}`, target_type: "applicant", target_id: applicant._id, meta: updates });
    if (updates.payment_status === "paid" && applicant.interest_status === "interested") {
      await telegramService.sendPaymentConfirmation(applicant);
      await notifyClassDetailsIfReady(applicant);
    }
    return res.status(200).json({ success: true, data: await populateApplicant(applicant) });
  } catch (error) { return next(error); }
}

async function setInterest(req, res, next) {
  try {
    const { interest_status } = req.body;
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    if (!["interested", "not_interested"].includes(interest_status))
      return res.status(400).json({ success: false, message: "Invalid interest status." });
    applicant.interest_status = interest_status;
    if (interest_status === "not_interested") applicant.reminder_enabled = false;
    await applicant.save();
    await audit.log({ req, action: "applicant.set_interest", description: `Set interest to ${interest_status} for ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name}`, target_type: "applicant", target_id: applicant._id });
    return res.status(200).json({ success: true, data: await populateApplicant(applicant) });
  } catch (error) { return next(error); }
}

async function assignSchedule(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    const scheduleId = req.body.assigned_schedule || req.body.schedule_id;
    if (!mongoose.Types.ObjectId.isValid(scheduleId))
      return res.status(400).json({ success: false, message: "A valid schedule id is required." });
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found." });
    applicant.assigned_schedule = schedule._id;
    applicant.reminder_log = [];
    await applicant.save();
    await audit.log({ req, action: "applicant.assign_schedule", description: `Assigned schedule "${schedule.name}" to ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name}`, target_type: "applicant", target_id: applicant._id });
    return res.status(200).json({ success: true, data: await notifyClassDetailsIfReady(applicant) });
  } catch (error) { return next(error); }
}

async function sendPaymentRequest(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id).select("-__v");
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    if (applicant.interest_status !== "interested")
      return res.status(400).json({ success: false, message: "Payment requests can only be sent to interested applicants." });
    if (applicant.price <= 0)
      return res.status(400).json({ success: false, message: "Set a price before sending a payment request." });
    const sent = await telegramService.sendPaymentRequest(applicant);
    if (!sent) return res.status(500).json({ success: false, message: "Unable to send payment request through Telegram." });
    await audit.log({ req, action: "payment.request_sent", description: `Payment request sent to ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name} (${applicant.price} ETB)`, target_type: "applicant", target_id: applicant._id });
    return res.status(200).json({ success: true, message: "Payment request sent successfully." });
  } catch (error) { return next(error); }
}

async function approvePayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    applicant.payment_status = "paid";
    await applicant.save();
    await audit.log({ req, action: "payment.approved", description: `Payment approved for ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name} (${applicant.price} ETB)`, target_type: "applicant", target_id: applicant._id });
    if (applicant.interest_status === "interested") await telegramService.sendPaymentConfirmation(applicant);
    return res.status(200).json({ success: true, data: await notifyClassDetailsIfReady(applicant) });
  } catch (error) { return next(error); }
}

async function rejectPayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    const reason = String(req.body.reason || "").trim();
    applicant.payment_status = "pending";
    applicant.payment_screenshot_url = "";
    await applicant.save();
    await audit.log({ req, action: "payment.rejected", description: `Payment rejected for ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name}. Reason: ${reason || "None provided"}`, target_type: "applicant", target_id: applicant._id, meta: { reason } });
    try {
      if (reason) await telegramService.sendMessage(applicant.telegram_id, `❌ Your payment was rejected.\n\nReason: ${reason}\n\nPlease re-upload your payment receipt.`);
    } catch {}
    return res.status(200).json({ success: true, data: await populateApplicant(applicant) });
  } catch (error) { return next(error); }
}

async function declineApprovedPayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    if (applicant.payment_status !== "paid")
      return res.status(400).json({ success: false, message: "This applicant does not have an approved payment." });
    const reason = String(req.body.reason || "").trim();
    const reimbursed = Boolean(req.body.reimbursed);
    if (!reason) return res.status(400).json({ success: false, message: "A reason is required to decline an approved payment." });
    applicant.payment_status = "pending";
    applicant.payment_screenshot_url = "";
    await applicant.save();
    await audit.log({ req, action: "payment.declined_approved", description: `Approved payment DECLINED for ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name}. Reason: ${reason}. Reimbursed: ${reimbursed ? "Yes" : "No"}`, target_type: "applicant", target_id: applicant._id, meta: { reason, reimbursed } });
    try {
      const msg = reimbursed
        ? `⚠️ Your previously approved payment has been declined and your payment has been reimbursed.\n\nReason: ${reason}`
        : `⚠️ Your previously approved payment has been declined.\n\nReason: ${reason}\n\nPlease contact us for further information.`;
      await telegramService.sendMessage(applicant.telegram_id, msg);
    } catch {}
    return res.status(200).json({ success: true, data: await populateApplicant(applicant) });
  } catch (error) { return next(error); }
}

async function requestFullPayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    if (applicant.interest_status !== "interested")
      return res.status(400).json({ success: false, message: "Full payment requests can only be sent to interested applicants." });
    const note = String(req.body.note || "").trim();
    await audit.log({ req, action: "payment.full_requested", description: `Full payment requested from ${applicant.personal_info?.first_name} ${applicant.personal_info?.last_name}`, target_type: "applicant", target_id: applicant._id });
    try {
      const msg = note
        ? `💳 Full payment is required.\n\n${note}\n\nTotal: ${applicant.price} ETB`
        : `💳 Full payment of ${applicant.price} ETB is required. Please upload your payment receipt.`;
      await telegramService.sendMessage(applicant.telegram_id, msg);
    } catch {}
    return res.status(200).json({ success: true, message: "Full payment request sent." });
  } catch (error) { return next(error); }
}

async function getReceipt(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id).populate("assigned_schedule");
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found." });
    if (applicant.payment_status !== "paid") return res.status(400).json({ success: false, message: "No approved payment found." });
    return res.status(200).json({
      success: true,
      data: {
        student_name: `${applicant.personal_info.first_name} ${applicant.personal_info.last_name}`,
        confirmation_id: applicant._id,
        amount: applicant.price,
        program: applicant.course_details?.program_type,
        approved_at: applicant.updatedAt
      }
    });
  } catch (error) { return next(error); }
}

module.exports = {
  getApplicants, getApplicantStats, getApplicantById, getApplicantByTelegramId,
  getApplicantActivity, updateApplicant, setInterest, assignSchedule,
  sendPaymentRequest, approvePayment, rejectPayment, declineApprovedPayment,
  requestFullPayment, getReceipt
};
