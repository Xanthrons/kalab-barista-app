const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    telegram_id: {
      type: Number,
      required: true,
      index: true
    },
    username: {
      type: String,
      default: "",
      trim: true
    },
    telegram_chat_id: {
      type: Number,
      default: null
    },
    telegram_user: {
      id: {
        type: Number,
        default: null
      },
      username: {
        type: String,
        default: ""
      }
    },
    personal_info: {
      first_name: {
        type: String,
        required: true,
        trim: true
      },
      last_name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      dob: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      }
    },
    course_details: {
      has_experience: {
        type: Boolean,
        required: true
      },
      program_type: {
        type: String,
        enum: ["Regular", "VIP"],
        required: true
      },
      vip_preference: {
        type: String,
        default: ""
      }
    },
    emergency: {
      contact_name: {
        type: String,
        required: true,
        trim: true
      },
      contact_phone: {
        type: String,
        required: true,
        trim: true
      }
    },
    meta: {
      motivation: {
        type: String,
        default: "",
        trim: true
      },
      source: {
        type: String,
        enum: ["Instagram", "Telegram", "Referral"],
        required: true
      }
    },
    interest_status: {
      type: String,
      enum: ["interested", "not_interested"],
      default: "interested"
    },
    price: {
      type: Number,
      default: 0
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    payment_screenshot_url: {
      type: String,
      default: ""
    },
    assigned_schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      default: null
    },
    reminder_enabled: {
      type: Boolean,
      default: true
    },
    reminder_log: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: true
  }
);

registrationSchema.pre("validate", function syncLegacyTelegramFields(next) {
  if (!this.telegram_id && this.telegram_user?.id) {
    this.telegram_id = this.telegram_user.id;
  }

  if (!this.username && this.telegram_user?.username) {
    this.username = this.telegram_user.username;
  }

  this.telegram_user = {
    id: this.telegram_id,
    username: this.username || ""
  };

  next();
});

module.exports = mongoose.model("Registration", registrationSchema);
