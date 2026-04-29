const Registration = require("../models/Registration");
const Schedule = require("../models/Schedule");

function normalizeSchedulePayload(payload = {}) {
  return {
    name: String(payload.name ?? "").trim(),
    type: String(payload.type ?? "").trim(),
    start_date: payload.start_date,
    days: Array.isArray(payload.days)
      ? payload.days.map((day) => String(day).trim()).filter(Boolean)
      : [],
    time: String(payload.time ?? "").trim(),
    instructor: String(payload.instructor ?? "").trim()
  };
}

function validateSchedulePayload(schedule) {
  const errors = {};

  if (!schedule.name) {
    errors.name = "Schedule name is required.";
  }

  if (!["Morning", "Afternoon", "Weekend", "Evening"].includes(schedule.type)) {
    errors.type = "Type must be Morning, Afternoon, Weekend or Evening.";
  }

  if (!schedule.start_date || Number.isNaN(new Date(schedule.start_date).getTime())) {
    errors.start_date = "A valid start date is required.";
  }

  if (!schedule.days.length) {
    errors.days = "Select at least one class day.";
  }

  if (!schedule.time) {
    errors.time = "Time is required.";
  }

  if (!schedule.instructor) {
    errors.instructor = "Instructor is required.";
  }

  return errors;
}

async function getSchedules(req, res, next) {
  try {
    const schedules = await Schedule.find({})
      .sort({ start_date: 1, createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    return next(error);
  }
}

async function createSchedule(req, res, next) {
  try {
    const value = normalizeSchedulePayload(req.body);
    const errors = validateSchedulePayload(value);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors
      });
    }

    const schedule = await Schedule.create(value);

    return res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const value = normalizeSchedulePayload(req.body);
    const errors = validateSchedulePayload(value);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true
    }).select("-__v");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found."
      });
    }

    await Registration.updateMany(
      { assigned_schedule: schedule._id },
      { $set: { reminder_log: [] } }
    );

    return res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteSchedule(req, res, next) {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id).select("-__v");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found."
      });
    }

    await Registration.updateMany(
      { assigned_schedule: schedule._id },
      {
        $set: {
          assigned_schedule: null,
          reminder_log: []
        }
      }
    );

    return res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
