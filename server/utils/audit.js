const AuditLog = require("../models/AuditLog");

async function log({ req, action, description, target_type = "", target_id = "", meta = {} }) {
  try {
    await AuditLog.create({
      actor_id: req?.auth?.id || null,
      actor_name: req?.auth?.user?.name || "System",
      actor_role: req?.auth?.role || "",
      action,
      description,
      target_type,
      target_id: target_id ? String(target_id) : "",
      meta
    });
  } catch (err) {
    // Audit logging must never break main flow
    console.error("Audit log error:", err.message);
  }
}

module.exports = { log };
