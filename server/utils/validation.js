const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ethiopianPhoneRegex = /^(?:\+251|251|0)?9\d{8}$/;

const allowedSchedules = ["Morning", "Afternoon", "Weekend"];
const allowedSources = ["Instagram", "Telegram", "Referral"];

const cleanString = (value) => String(value ?? "").trim();
const cleanPhone = (value) => cleanString(value).replace(/[\s-]/g, "");

function validateRegistrationPayload(payload = {}) {
  const errors = {};
  const telegramId = Number(payload.telegram_id ?? payload.telegram_user?.id ?? 0);
  const username = cleanString(payload.username ?? payload.telegram_user?.username);

  const value = {
    telegram_id: telegramId,
    username,
    personal_info: {
      first_name: cleanString(payload.personal_info?.first_name),
      last_name: cleanString(payload.personal_info?.last_name),
      email: cleanString(payload.personal_info?.email).toLowerCase(),
      phone: cleanPhone(payload.personal_info?.phone),
      dob: cleanString(payload.personal_info?.dob),
      address: cleanString(payload.personal_info?.address)
    },
    course_details: {
      has_experience: payload.course_details?.has_experience,
      program_type: cleanString(payload.course_details?.program_type),
      vip_preference: cleanString(payload.course_details?.vip_preference)
    },
    emergency: {
      contact_name: cleanString(payload.emergency?.contact_name),
      contact_phone: cleanPhone(payload.emergency?.contact_phone)
    },
    meta: {
      motivation: cleanString(payload.meta?.motivation),
      source: cleanString(payload.meta?.source)
    }
  };

  if (!Number.isFinite(value.telegram_id) || value.telegram_id <= 0) {
    errors.telegram_id = "Telegram user id must be a valid number.";
  }

  if (!value.personal_info.first_name) {
    errors.first_name = "First name is required.";
  }
  if (!value.personal_info.last_name) {
    errors.last_name = "Last name is required.";
  }
  if (!emailRegex.test(value.personal_info.email)) {
    errors.email = "Valid email is required.";
  }
  if (!ethiopianPhoneRegex.test(value.personal_info.phone)) {
    errors.phone = "Valid Ethiopian phone number is required.";
  }
  if (!value.personal_info.dob) {
    errors.dob = "Date of birth is required.";
  }
  if (!value.personal_info.address) {
    errors.address = "Address is required.";
  }

  if (typeof value.course_details.has_experience !== "boolean") {
    errors.has_experience = "Experience flag must be true or false.";
  }
  if (!["Regular", "VIP"].includes(value.course_details.program_type)) {
    errors.program_type = "Program type must be Regular or VIP.";
  }
  if (
    value.course_details.program_type === "VIP" &&
    !allowedSchedules.includes(value.course_details.vip_preference)
  ) {
    errors.vip_preference = "VIP preference must be Morning, Afternoon, or Weekend.";
  }

  if (!value.emergency.contact_name) {
    errors.contact_name = "Emergency contact name is required.";
  }
  if (!ethiopianPhoneRegex.test(value.emergency.contact_phone)) {
    errors.contact_phone = "Valid emergency contact phone is required.";
  }
  if (!allowedSources.includes(value.meta.source)) {
    errors.source = "Source must be Instagram, Telegram, or Referral.";
  }

  if (value.course_details.program_type !== "VIP") {
    value.course_details.vip_preference = "";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value
  };
}

module.exports = {
  validateRegistrationPayload
};
