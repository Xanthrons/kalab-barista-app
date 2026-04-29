const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password_hash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin"
    },
    is_active: {
      type: Boolean,
      default: true
    },
    last_login_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AdminUser", adminUserSchema);
