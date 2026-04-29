const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor_id: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    actor_name: { type: String, default: "System" },
    actor_role: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    target_type: { type: String, default: "" },
    target_id: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
