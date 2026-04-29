const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Schedule = require("../models/Schedule");
const telegramService = require("../services/telegramService");

function buildTelegramLookup(telegramId) {
  const parsedTelegramId = Number(telegramId);

  return {
    $or: [
      { telegram_id: parsedTelegramId },
      { "telegram_user.id": parsedTelegramId }
    ]
  };
}

async function populateApplicant(applicant) {
  if (!applicant) {
    return null;
  }

  return applicant.populate("assigned_schedule");
}

async function notifyClassDetailsIfReady(applicant) {
  const hydratedApplicant = await populateApplicant(applicant);

  if (
    hydratedApplicant &&
    hydratedApplicant.interest_status === "interested" &&
    hydratedApplicant.payment_status === "paid" &&
    hydratedApplicant.assigned_schedule
  ) {
    await telegramService.sendClassDetails(
      hydratedApplicant,
      hydratedApplicant.assigned_schedule
    );
  }

  return hydratedApplicant;
}

async function getApplicants(req, res, next) {
  try {
    const { search = "", payment_status, interest_status } = req.query;
    const filter = {};

    if (payment_status && payment_status !== "all") {
      filter.payment_status = payment_status;
    }

    if (interest_status && interest_status !== "all") {
      filter.interest_status = interest_status;
    }

    if (search.trim()) {
      const pattern = new RegExp(search.trim(), "i");
      filter.$or = [
        { "personal_info.first_name": pattern },
        { "personal_info.last_name": pattern },
        { "personal_info.email": pattern },
        { "personal_info.phone": pattern },
        { username: pattern }
      ];
    }

    const [applicants, stats] = await Promise.all([
      Registration.find(filter)
        .populate("assigned_schedule")
        .sort({ createdAt: -1 })
        .select("-__v"),
      Registration.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            paid: {
              $sum: {
                $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$payment_status", "pending"] }, 1, 0]
              }
            },
            interested: {
              $sum: {
                $cond: [{ $eq: ["$interest_status", "interested"] }, 1, 0]
              }
            },
            not_interested: {
              $sum: {
                $cond: [{ $eq: ["$interest_status", "not_interested"] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: applicants,
      meta: {
        stats: stats[0] || {
          total: 0,
          paid: 0,
          pending: 0,
          interested: 0,
          not_interested: 0
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getApplicantStats(req, res, next) {
  try {
    const [stats] = await Registration.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: {
            $sum: {
              $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$payment_status", "pending"] }, 1, 0]
            }
          },
          interested: {
            $sum: {
              $cond: [{ $eq: ["$interest_status", "interested"] }, 1, 0]
            }
          },
          schedules_assigned: {
            $sum: {
              $cond: [{ $ifNull: ["$assigned_schedule", false] }, 1, 0]
            }
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: stats || {
        total: 0,
        paid: 0,
        pending: 0,
        interested: 0,
        schedules_assigned: 0
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getApplicantById(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id)
      .populate("assigned_schedule")
      .select("-__v");

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: applicant
    });
  } catch (error) {
    return next(error);
  }
}

async function getApplicantByTelegramId(req, res, next) {
  try {
    const applicant = await Registration.findOne(
      buildTelegramLookup(req.params.telegramId)
    )
      .populate("assigned_schedule")
      .select("-__v");

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: applicant
    });
  } catch (error) {
    return next(error);
  }
}

async function updateApplicant(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    const updates = req.body || {};

    if (updates.price !== undefined) {
      applicant.price = Number(updates.price) || 0;
    }

    if (updates.reminder_enabled !== undefined) {
      applicant.reminder_enabled = Boolean(updates.reminder_enabled);
    }

    if (updates.payment_status !== undefined) {
      applicant.payment_status = updates.payment_status;
    }

    await applicant.save();

    if (
      updates.payment_status === "paid" &&
      applicant.interest_status === "interested"
    ) {
      await telegramService.sendPaymentConfirmation(applicant);
      await notifyClassDetailsIfReady(applicant);
    }

    return res.status(200).json({
      success: true,
      data: await populateApplicant(applicant)
    });
  } catch (error) {
    return next(error);
  }
}

async function setInterest(req, res, next) {
  try {
    const { interest_status } = req.body;
    const applicant = await Registration.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    if (!["interested", "not_interested"].includes(interest_status)) {
      return res.status(400).json({
        success: false,
        message: "Interest status must be interested or not_interested."
      });
    }

    applicant.interest_status = interest_status;

    if (interest_status === "not_interested") {
      applicant.reminder_enabled = false;
    }

    await applicant.save();

    return res.status(200).json({
      success: true,
      data: await populateApplicant(applicant)
    });
  } catch (error) {
    return next(error);
  }
}

async function assignSchedule(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    const scheduleId = req.body.assigned_schedule || req.body.schedule_id;

    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: "A valid schedule id is required."
      });
    }

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found."
      });
    }

    applicant.assigned_schedule = schedule._id;
    applicant.reminder_log = [];
    await applicant.save();

    return res.status(200).json({
      success: true,
      data: await notifyClassDetailsIfReady(applicant)
    });
  } catch (error) {
    return next(error);
  }
}

async function sendPaymentRequest(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id).select("-__v");

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    if (applicant.interest_status !== "interested") {
      return res.status(400).json({
        success: false,
        message: "Payment requests can only be sent to interested applicants."
      });
    }

    if (applicant.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Set a price before sending a payment request."
      });
    }

    const sent = await telegramService.sendPaymentRequest(applicant);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send the payment request through Telegram."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment request sent successfully."
    });
  } catch (error) {
    return next(error);
  }
}

async function approvePayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found."
      });
    }

    applicant.payment_status = "paid";
    await applicant.save();

    if (applicant.interest_status === "interested") {
      await telegramService.sendPaymentConfirmation(applicant);
    }

    return res.status(200).json({
      success: true,
      data: await notifyClassDetailsIfReady(applicant)
    });
  } catch (error) {
    return next(error);
  }
}
async function getApplicantActivity(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    if (!applicant) return res.status(404).json({ success: false, message: "Not found" });
    // If you don't have a separate activity model, return the log from the registration
    return res.status(200).json({ success: true, data: applicant.activity_log || [] });
  } catch (error) { next(error); }
}

async function rejectPayment(req, res, next) {
  try {
    const { reason } = req.body;
    const applicant = await Registration.findById(req.params.id);
    applicant.payment_status = "rejected";
    await applicant.save();
    await telegramService.sendMessage(applicant, `❌ Payment Rejected: ${reason}`);
    return res.status(200).json({ success: true, message: "Payment rejected." });
  } catch (error) { next(error); }
}

async function requestFullPayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    await telegramService.sendMessage(applicant, "⚠️ Please complete your full payment to secure your spot.");
    return res.status(200).json({ success: true, message: "Request sent." });
  } catch (error) { next(error); }
}

async function getReceipt(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    // Logic to generate or fetch receipt
    return res.status(200).json({ success: true, data: { amount: applicant.price, status: applicant.payment_status } });
  } catch (error) { next(error); }
}

async function declineApprovedPayment(req, res, next) {
  try {
    const applicant = await Registration.findById(req.params.id);
    applicant.payment_status = "pending";
    await applicant.save();
    return res.status(200).json({ success: true, message: "Payment status reset to pending." });
  } catch (error) { next(error); }
}

module.exports = {
  getApplicants,
  getApplicantStats,
  getApplicantById,
  getApplicantByTelegramId,
  getApplicantActivity, 
  updateApplicant,
  setInterest,
  assignSchedule,
  sendPaymentRequest,
  approvePayment,
  rejectPayment,       
  requestFullPayment,  
  getReceipt,          
  declineApprovedPayment 
};
