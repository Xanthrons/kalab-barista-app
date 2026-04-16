const cron = require("node-cron");
const Registration = require("../models/Registration");
const telegramService = require("./telegramService");
const { getDaysUntil, getReminderOffsets } = require("../utils/scheduleFormatter");

class ReminderService {
  start() {
    cron.schedule(
      "0 9 * * *",
      async () => {
        await this.sendReminders();
      },
      {
        timezone: process.env.REMINDER_TIMEZONE || "Africa/Addis_Ababa"
      }
    );
  }

  async sendReminders() {
    try {
      const applicants = await Registration.find({
        interest_status: "interested",
        payment_status: "pending",
        reminder_enabled: true,
        assigned_schedule: { $ne: null }
      }).populate("assigned_schedule");

      for (const applicant of applicants) {
        const schedule = applicant.assigned_schedule;

        if (!schedule?.start_date) {
          continue;
        }

        const daysUntilStart = getDaysUntil(schedule.start_date);

        if (!getReminderOffsets().includes(daysUntilStart)) {
          continue;
        }

        if (applicant.reminder_log.includes(daysUntilStart)) {
          continue;
        }

        const sent = await telegramService.sendReminder(
          applicant,
          schedule,
          daysUntilStart
        );

        if (sent) {
          applicant.reminder_log = [...applicant.reminder_log, daysUntilStart];
          await applicant.save();
        }
      }
    } catch (error) {
      console.error("Error in sendReminders:", error);
    }
  }
}

module.exports = new ReminderService();
