const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ethiopianPhoneRegex = /^(?:\+251|251|0)?9\d{8}$/;

const normalizePhone = (value = "") => value.replace(/[\s-]/g, "");

const required = (value) => String(value ?? "").trim().length > 0;

export const validateStep = (step, formData) => {
  const errors = {};
  const { personal_info, course_details, emergency, meta } = formData;

  if (step === 1) {
    if (!required(personal_info.first_name)) errors.first_name = "First name is required.";
    if (!required(personal_info.last_name)) errors.last_name = "Last name is required.";
    if (!emailRegex.test(personal_info.email)) errors.email = "Enter a valid email address.";
    if (!ethiopianPhoneRegex.test(normalizePhone(personal_info.phone))) {
      errors.phone = "Use a valid Ethiopian phone number, for example 0912345678.";
    }
    if (!required(personal_info.dob)) errors.dob = "Date of birth is required.";
    if (!required(personal_info.address)) errors.address = "Address is required.";
  }

  if (step === 2) {
    if (typeof course_details.has_experience !== "boolean") {
      errors.has_experience = "Please choose whether you have experience.";
    }
    if (!required(course_details.program_type)) {
      errors.program_type = "Program type is required.";
    }
    if (
      course_details.program_type === "VIP" &&
      !required(course_details.vip_preference)
    ) {
      errors.vip_preference = "Please select your preferred VIP schedule.";
    }
  }

  if (step === 3) {
    if (!required(emergency.contact_name)) {
      errors.contact_name = "Emergency contact name is required.";
    }
    if (!ethiopianPhoneRegex.test(normalizePhone(emergency.contact_phone))) {
      errors.contact_phone = "Use a valid Ethiopian phone number.";
    }
    // Motivation is now optional
    if (!required(meta.source)) {
      errors.source = "Please tell us how you heard about the academy.";
    }
  }

  return errors;
};

export const normalizeSubmission = (formData, telegramUser) => ({
  telegram_id: Number(telegramUser.id || 0),
  username: telegramUser.username || "",
  personal_info: {
    first_name: formData.personal_info.first_name.trim(),
    last_name: formData.personal_info.last_name.trim(),
    email: formData.personal_info.email.trim().toLowerCase(),
    phone: normalizePhone(formData.personal_info.phone),
    dob: formData.personal_info.dob,
    address: formData.personal_info.address.trim()
  },
  course_details: {
    has_experience: Boolean(formData.course_details.has_experience),
    program_type: formData.course_details.program_type,
    vip_preference:
      formData.course_details.program_type === "VIP"
        ? formData.course_details.vip_preference
        : ""
  },
  emergency: {
    contact_name: formData.emergency.contact_name.trim(),
    contact_phone: normalizePhone(formData.emergency.contact_phone)
  },
  meta: {
    motivation: formData.meta.motivation.trim(),
    source: formData.meta.source
  }
});
