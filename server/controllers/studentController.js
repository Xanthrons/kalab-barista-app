const Registration = require("../models/Registration");

function buildTelegramLookup(telegramId) {
  const parsedTelegramId = Number(telegramId);

  return {
    $or: [
      { telegram_id: parsedTelegramId },
      { "telegram_user.id": parsedTelegramId }
    ]
  };
}

async function getStudentStatus(req, res, next) {
  try {
    const { telegramId } = req.params;

    const student = await Registration.findOne(buildTelegramLookup(telegramId))
      .populate("assigned_schedule")
      .select("-__v");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    return next(error);
  }
}

async function updateStudentProfile(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedUpdates = {
      "personal_info.first_name": updates.personal_info?.first_name,
      "personal_info.last_name": updates.personal_info?.last_name,
      "personal_info.email": updates.personal_info?.email,
      "personal_info.phone": updates.personal_info?.phone,
      "personal_info.address": updates.personal_info?.address,
      "emergency.contact_name": updates.emergency?.contact_name,
      "emergency.contact_phone": updates.emergency?.contact_phone,
      "meta.motivation": updates.meta?.motivation
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const student = await Registration.findByIdAndUpdate(id, allowedUpdates, {
      new: true,
      runValidators: true
    })
      .populate("assigned_schedule")
      .select("-__v");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStudentStatus,
  updateStudentProfile
};
