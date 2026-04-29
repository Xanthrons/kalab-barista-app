const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");
const SystemSetting = require("../models/SystemSetting");

async function ensureAdminAccount({
  name,
  email,
  password,
  role
}) {
  if (!email || !password) {
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await AdminUser.findOne({ email: normalizedEmail });

  if (existing) {
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  await AdminUser.create({
    name: name || role,
    email: normalizedEmail,
    password_hash,
    role
  });
}

async function ensureSystemSettings() {
  const defaults = {
    bank_name: process.env.BANK_NAME || "Commercial Bank of Ethiopia",
    bank_account_name: process.env.BANK_ACCOUNT_NAME || "Kalab Barista Academy",
    bank_account_number: process.env.BANK_ACCOUNT_NUMBER || "0000000000",
    payment_instructions:
      process.env.PAYMENT_INSTRUCTIONS ||
      "After payment, reply to the Telegram bot with your payment screenshot.",
    support_contact: process.env.SUPPORT_CONTACT || "@kalabbarista"
  };

  await SystemSetting.findOneAndUpdate(
    { key: "general" },
    { $setOnInsert: { value: defaults } },
    { upsert: true, new: true }
  );
}

async function bootstrapSystem() {
  await ensureAdminAccount({
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    role: "super_admin"
  });

  await ensureAdminAccount({
    name: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin"
  });

  await ensureSystemSettings();
}

module.exports = {
  bootstrapSystem
};
