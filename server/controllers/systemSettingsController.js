const SystemSetting = require("../models/SystemSetting");

async function getSystemSettings(req, res, next) {
  try {
    const settings = await SystemSetting.findOne({ key: "general" });

    return res.status(200).json({
      success: true,
      data: settings?.value || {}
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSystemSettings(req, res, next) {
  try {
    const allowedKeys = [
      "bank_name",
      "bank_account_name",
      "bank_account_number",
      "payment_instructions",
      "support_contact"
    ];

    const existing = await SystemSetting.findOne({ key: "general" });

    const nextValue = allowedKeys.reduce((accumulator, key) => {
      if (req.body[key] !== undefined) {
        accumulator[key] = req.body[key];
      }
      return accumulator;
    }, { ...(existing?.value || {}) });

    const settings = await SystemSetting.findOneAndUpdate(
      { key: "general" },
      { $set: { value: nextValue } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      data: settings.value
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSystemSettings,
  updateSystemSettings
};
