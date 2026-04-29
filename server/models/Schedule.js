const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["Morning", "Afternoon", "Weekend", "Evening"]
    },
    start_date: {
      type: Date,
      required: true
    },
    days: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one class day is required."
      }
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    instructor: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
