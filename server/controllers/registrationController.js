const Registration = require("../models/Registration");
const { validateRegistrationPayload } = require("../utils/validation");
const telegramService = require("../services/telegramService");

async function registerApplicant(req, res, next) {
  try {
    const { isValid, errors, value } = validateRegistrationPayload(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors
      });
    }

    const registration = await Registration.findOneAndUpdate(
      {
        $or: [
          { telegram_id: value.telegram_id },
          { "telegram_user.id": value.telegram_id }
        ]
      },
      {
        $set: {
          ...value,
          telegram_user: {
            id: value.telegram_id,
            username: value.username || ""
          }
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    try {
      await telegramService.sendRegistrationConfirmation(registration);
    } catch (telegramError) {
      console.error("Failed to send Telegram message:", telegramError);
    }

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully.",
      data: {
        id: registration._id
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerApplicant
};
