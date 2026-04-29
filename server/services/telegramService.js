const TelegramBot = require("node-telegram-bot-api");
const Registration = require("../models/Registration");
const SystemSetting = require("../models/SystemSetting");
// REMOVED: saveTelegramPhoto import as it is no longer needed
const {
  formatDate,
  formatScheduleMessage
} = require("../utils/scheduleFormatter");

class TelegramService {
  constructor() {
    this.bot = null;
    this.initialize();
  }

  initialize() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token || token === "YOUR_TELEGRAM_BOT_TOKEN_HERE") {
      console.warn("Telegram bot token is missing. Bot automation is disabled.");
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.setupBot();
  }

  async findApplicantByTelegramId(telegramId) {
    return Registration.findOne({
      $or: [
        { telegram_id: Number(telegramId) },
        { "telegram_user.id": Number(telegramId) }
      ]
    });
  }

  async getSystemSettings() {
    const settings = await SystemSetting.findOne({ key: "general" });
    return settings?.value || {};
  }

  shouldBlockAutomation(applicant) {
    return applicant?.interest_status === "not_interested";
  }

  async syncTelegramProfile(message, applicant = null) {
    if (!message?.from?.id || !message?.chat?.id) {
      return applicant;
    }

    const telegramId = Number(message.from.id);
    const username = message.from.username || message.from.first_name || "";
    const chatId = Number(message.chat.id);

    const registration = applicant || (await this.findApplicantByTelegramId(telegramId));

    if (!registration) {
      return null;
    }

    registration.telegram_id = telegramId;
    registration.username = username;
    registration.telegram_chat_id = chatId;
    registration.telegram_user = {
      id: telegramId,
      username
    };

    await registration.save();
    return registration;
  }

  setupBot() {
    this.bot.onText(/\/start/i, async (message) => {
      try {
        await this.syncTelegramProfile(message);
      } catch (error) {
        console.error("Failed to sync Telegram profile on /start:", error);
      }

      await this.bot.sendMessage(
        message.chat.id,
        "Welcome to Kalab Barista Academy. Register in the mini app and send your payment screenshot here when requested."
      );
    });

    this.bot.onText(/\/stop(reminders)?/i, async (message) => {
      try {
        const applicant = await this.findApplicantByTelegramId(message.from.id);

        if (!applicant) {
          await this.bot.sendMessage(
            message.chat.id,
            "We could not match your Telegram account to an application yet. Please register first."
          );
          return;
        }

        applicant.reminder_enabled = false;
        await applicant.save();

        await this.bot.sendMessage(
          message.chat.id,
          "Payment reminders have been turned off. You can still send your payment screenshot here anytime."
        );
      } catch (error) {
        console.error("Failed to stop reminders from bot:", error);
      }
    });

    // UPDATED: Optimized photo handling logic
    this.bot.on("photo", async (message) => {
      try {
        const applicant = await this.syncTelegramProfile(message);

        if (!applicant) {
          await this.bot.sendMessage(
            message.chat.id,
            "Please complete your registration first so we can link your screenshot."
          );
          return;
        }

        // Get the highest resolution version of the photo
        const highestResolutionPhoto = message.photo?.[message.photo.length - 1];

        if (!highestResolutionPhoto?.file_id) {
          return;
        }

        /**
         * UPDATED LOGIC:
         * We no longer call saveTelegramPhoto().
         * We store the file_id directly. This is permanent as long as the 
         * bot is active and the user doesn't delete the message.
         */
        applicant.payment_screenshot_url = highestResolutionPhoto.file_id; 
        applicant.payment_status = "pending";
        await applicant.save();

        await this.bot.sendMessage(
          message.chat.id,
          "Payment screenshot received. Our team will review it shortly."
        );
      } catch (error) {
        console.error("Error handling payment screenshot:", error);
      }
    });

    this.bot.on("message", async (message) => {
      if (!message?.text || message.text.startsWith("/")) {
        return;
      }

      try {
        await this.syncTelegramProfile(message);
      } catch (error) {
        console.error("Failed to sync Telegram profile from message:", error);
      }
    });
  }

  resolveChatId(applicantOrId) {
    if (typeof applicantOrId === "number") {
      return applicantOrId;
    }

    if (!applicantOrId) {
      return null;
    }

    return applicantOrId.telegram_chat_id || applicantOrId.telegram_id || null;
  }

  async sendMessage(applicantOrId, message) {
    if (!this.bot) {
      return false;
    }

    const chatId = this.resolveChatId(applicantOrId);

    if (!chatId) {
      return false;
    }

    try {
      await this.bot.sendMessage(chatId, message, {
        disable_web_page_preview: true
      });
      return true;
    } catch (error) {
      console.error(`Error sending Telegram message to ${chatId}:`, error);
      return false;
    }
  }

  async sendRegistrationConfirmation(applicant) {
    return this.sendMessage(
      applicant,
      "Thank you for registering. We will contact you soon."
    );
  }

  async sendPaymentRequest(applicant) {
    if (this.shouldBlockAutomation(applicant)) {
      return false;
    }

    const settings = await this.getSystemSettings();
    const message = [
      "☕️ *Payment Request*",
      "",
      `*Price:* ${applicant.price} ETB`,
      `*Bank:* ${settings.bank_name || "Commercial Bank of Ethiopia"}`,
      `*Account Name:* ${settings.bank_account_name || "Kalab Barista Academy"}`,
      `*Account Number:* ${settings.bank_account_number || "0000000000"}`,
      "",
      settings.payment_instructions ||
        "After payment, reply to this message with your payment screenshot."
    ].join("\n");

    // Using parse_mode: 'Markdown' for a more professional look
    try {
      const chatId = this.resolveChatId(applicant);
      if (chatId) {
        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        return true;
      }
    } catch (e) {
      return this.sendMessage(applicant, message); // Fallback to plain text
    }
  }

  async sendPaymentConfirmation(applicant) {
    if (this.shouldBlockAutomation(applicant)) {
      return false;
    }

    return this.sendMessage(
      applicant,
      "✅ Your payment has been approved. Thank you! We will share your class details as soon as your schedule is assigned."
    );
  }

  async sendClassDetails(applicant, schedule) {
    if (this.shouldBlockAutomation(applicant)) {
      return false;
    }

    return this.sendMessage(applicant, formatScheduleMessage(schedule));
  }

  async sendReminder(applicant, schedule, daysBefore) {
    if (this.shouldBlockAutomation(applicant)) {
      return false;
    }

    const label = daysBefore === 1 ? "tomorrow" : `in ${daysBefore} days`;
    const message = [
      `🔔 *Reminder:* your ${schedule.name} class starts ${label}.`,
      "",
      `*Start Date:* ${formatDate(schedule.start_date)}`,
      `*Days:* ${schedule.days.join(", ")}`,
      `*Time:* ${schedule.time}`,
      `*Instructor:* ${schedule.instructor}`,
      "",
      `*Outstanding payment:* ${applicant.price} ETB`,
      "Please ensure your payment is completed to secure your seat."
    ].join("\n");

    try {
      const chatId = this.resolveChatId(applicant);
      if (chatId) {
        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        return true;
      }
    } catch (e) {
      return this.sendMessage(applicant, message);
    }
  }
}

module.exports = new TelegramService();