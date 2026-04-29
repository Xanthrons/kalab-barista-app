import {
  getCountryCallingCode,
  parsePhoneNumberFromString
} from "libphonenumber-js";

const strictEmailRegex =
  /^(?=.{6,254}$)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const nameRegex = /^[\p{L}]+(?:\/[\p{L}]+)*$/u;
const NAME_LETTER_REGEX = /\p{L}/gu;

export const STEP_FIELDS = {
  1: ["first_name", "last_name", "email", "phone", "dob", "address"],
  2: ["has_experience", "program_type", "vip_preference"],
  3: ["contact_name", "contact_phone", "motivation", "source"]
};

export const FIELD_TO_STEP = Object.entries(STEP_FIELDS).reduce(
  (accumulator, [step, fields]) => ({
    ...accumulator,
    ...Object.fromEntries(fields.map((field) => [field, Number(step)]))
  }),
  {}
);

const required = (value) => String(value ?? "").trim().length > 0;

export function normalizeCountryCode(country = "et") {
  return String(country || "et").toLowerCase();
}

function normalizeCountryCodeForPhoneLib(country = "et") {
  return normalizeCountryCode(country).toUpperCase();
}

export function getCountryDialCode(country = "et") {
  try {
    return `+${getCountryCallingCode(normalizeCountryCodeForPhoneLib(country))}`;
  } catch (error) {
    return "+251";
  }
}

export function sanitizeNameInput(value = "") {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}/]/gu, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

export function normalizeNameValue(value = "") {
  return sanitizeNameInput(value).trim();
}

function countLetters(value = "") {
  const matches = normalizeNameValue(value).match(NAME_LETTER_REGEX);
  return matches ? matches.length : 0;
}

function sanitizePhoneValue(value = "") {
  return String(value ?? "").replace(/[^\d+]/g, "");
}

function resolvePhoneConfig(countryOrOptions = "et") {
  if (typeof countryOrOptions === "string") {
    return {
      country: normalizeCountryCode(countryOrOptions),
      allowEmpty: false
    };
  }

  return {
    country: normalizeCountryCode(countryOrOptions.country || "et"),
    allowEmpty: Boolean(countryOrOptions.allowEmpty)
  };
}

function parsePhone(value = "", country = "et") {
  const sanitized = sanitizePhoneValue(value).trim();

  if (!sanitized) {
    return null;
  }

  return (
    parsePhoneNumberFromString(
      sanitized,
      normalizeCountryCodeForPhoneLib(country)
    ) || null
  );
}

export function normalizePhoneInput(value = "", country = "et") {
  const { country: normalizedCountry, allowEmpty } = resolvePhoneConfig(country);
  const sanitized = sanitizePhoneValue(value).trim();

  if (!sanitized) {
    return allowEmpty ? "" : "";
  }

  const phone = parsePhone(sanitized, normalizedCountry);
  return phone?.number || sanitized;
}

export function formatPhoneDisplay(value = "") {
  return String(value ?? "").trim();
}

export function validatePhoneNumber(
  value,
  { country = "et", required: isRequired = false, t }
) {
  const sanitized = sanitizePhoneValue(value).trim();

  if (!sanitized) {
    return isRequired ? t("phoneRequired") : "";
  }

  const phone = parsePhone(sanitized, country);

  if (!phone || !phone.isValid()) {
    return t("phoneInvalid");
  }

  if (normalizeCountryCode(country) === "et" && !/^[97]/.test(phone.nationalNumber)) {
    return t("ethiopianPhoneStart");
  }

  return "";
}

function validateName(
  value,
  { required: isRequired = false, requiredKey, invalidKey, t }
) {
  const normalized = normalizeNameValue(value);

  if (!normalized) {
    return isRequired ? t(requiredKey) : "";
  }

  if (countLetters(normalized) < 2) {
    return t("nameMinLength");
  }

  if (!nameRegex.test(normalized)) {
    return t(invalidKey);
  }

  return "";
}

function parseDob(value = "") {
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  if (year < 1950 || year > currentYear) {
    return { outOfRange: true };
  }

  const date = new Date(year, month - 1, day);
  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isValid ? date : null;
}

export function validateField(field, formData, t) {
  const { personal_info, course_details, emergency, meta } = formData;

  switch (field) {
    case "first_name":
      return validateName(personal_info.first_name, {
        required: true,
        requiredKey: "firstNameRequired",
        invalidKey: "nameFormat",
        t
      });

    case "last_name":
      return validateName(personal_info.last_name, {
        required: true,
        requiredKey: "lastNameRequired",
        invalidKey: "nameFormat",
        t
      });

    case "email":
      if (required(personal_info.email) &&
          !strictEmailRegex.test(personal_info.email.trim())) {
        return t("emailInvalid");
      }

      return "";

    case "phone":
      return validatePhoneNumber(personal_info.phone, {
        country: personal_info.phone_country || "et",
        required: true,
        t
      });

    case "dob":
      if (!required(personal_info.dob)) {
        return t("dobRequired");
      }

      const parsedDob = parseDob(personal_info.dob);
      if (!parsedDob) {
        return t("dobInvalid");
      }

      if (parsedDob.outOfRange) {
        return t("dobRange");
      }

      return "";

    case "address":
      return required(personal_info.address) ? "" : t("addressRequired");

    case "has_experience":
      return typeof course_details.has_experience === "boolean"
        ? ""
        : t("experienceRequired");

    case "program_type":
      return required(course_details.program_type)
        ? ""
        : t("programRequired");

    case "vip_preference":
      return course_details.program_type === "VIP" &&
        !required(course_details.vip_preference)
        ? t("vipRequired")
        : "";

    case "contact_name":
      return validateName(emergency.contact_name, {
        required: false,
        requiredKey: "firstNameRequired",
        invalidKey: "emergencyNameInvalid",
        t
      });

    case "contact_phone":
      return validatePhoneNumber(emergency.contact_phone, {
        country: emergency.contact_phone_country || "et",
        required: false,
        t
      });

    case "motivation":
      return meta.motivation?.length > 1000
        ? t("motivationLimit")
        : "";

    case "source":
      return required(meta.source) ? "" : t("sourceRequired");

    default:
      return "";
  }
}

export function validateStep(step, formData, t) {
  const errors = {};
  const { personal_info, course_details, emergency, meta } = formData;

  if (step === 1) {
    const firstNameError = validateName(personal_info.first_name, {
      required: true,
      requiredKey: "firstNameRequired",
      invalidKey: "nameFormat",
      t
    });

    if (firstNameError) {
      errors.first_name = firstNameError;
    }

    const lastNameError = validateName(personal_info.last_name, {
      required: true,
      requiredKey: "lastNameRequired",
      invalidKey: "nameFormat",
      t
    });

    if (lastNameError) {
      errors.last_name = lastNameError;
    }

    if (
      required(personal_info.email) &&
      !strictEmailRegex.test(personal_info.email.trim())
    ) {
      errors.email = t("emailInvalid");
    }

    const phoneError = validatePhoneNumber(personal_info.phone, {
      country: personal_info.phone_country || "et",
      required: true,
      t
    });

    if (phoneError) {
      errors.phone = phoneError;
    }

    if (!required(personal_info.dob)) {
      errors.dob = t("dobRequired");
    } else {
      const parsedDob = parseDob(personal_info.dob);

      if (!parsedDob) {
        errors.dob = t("dobInvalid");
      } else if (parsedDob.outOfRange) {
        errors.dob = t("dobRange");
      }
    }

    if (!required(personal_info.address)) {
      errors.address = t("addressRequired");
    }
  }

  if (step === 2) {
    if (typeof course_details.has_experience !== "boolean") {
      errors.has_experience = t("experienceRequired");
    }

    if (!required(course_details.program_type)) {
      errors.program_type = t("programRequired");
    }

    if (
      course_details.program_type === "VIP" &&
      !required(course_details.vip_preference)
    ) {
      errors.vip_preference = t("vipRequired");
    }
  }

  if (step === 3) {
    const emergencyNameError = validateName(emergency.contact_name, {
      required: false,
      requiredKey: "firstNameRequired",
      invalidKey: "emergencyNameInvalid",
      t
    });

    if (emergencyNameError) {
      errors.contact_name = emergencyNameError;
    }

    const emergencyPhoneError = validatePhoneNumber(emergency.contact_phone, {
      country: emergency.contact_phone_country || "et",
      required: false,
      t
    });

    if (emergencyPhoneError) {
      errors.contact_phone = emergencyPhoneError;
    }

    if (meta.motivation?.length > 1000) {
      errors.motivation = t("motivationLimit");
    }

    if (!required(meta.source)) {
      errors.source = t("sourceRequired");
    }
  }

  return errors;
}

export const normalizeSubmission = (formData, telegramUser) => ({
  telegram_id: Number(telegramUser.id || 0),
  username: telegramUser.username || "",
  personal_info: {
    first_name: normalizeNameValue(formData.personal_info.first_name),
    last_name: normalizeNameValue(formData.personal_info.last_name),
    email: formData.personal_info.email.trim().toLowerCase(),
    phone: normalizePhoneInput(
      formData.personal_info.phone,
      formData.personal_info.phone_country || "et"
    ),
    dob: formData.personal_info.dob,
    address: formData.personal_info.address.trim()
  },
  course_details: {
    has_experience: formData.course_details.has_experience,
    program_type: formData.course_details.program_type,
    vip_preference:
      formData.course_details.program_type === "VIP"
        ? formData.course_details.vip_preference
        : ""
  },
  emergency: {
    contact_name: normalizeNameValue(formData.emergency.contact_name),
    contact_phone: normalizePhoneInput(
      formData.emergency.contact_phone,
      formData.emergency.contact_phone_country || "et"
    )
  },
  meta: {
    motivation: formData.meta.motivation.trim(),
    source: formData.meta.source
  }
});
