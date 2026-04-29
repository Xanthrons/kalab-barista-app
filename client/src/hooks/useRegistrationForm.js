import { useEffect, useMemo, useState } from "react";
import {
  FIELD_TO_STEP,
  getCountryDialCode,
  normalizeCountryCode,
  normalizePhoneInput,
  STEP_FIELDS,
  validateField,
  validateStep
} from "../utils/validators";

const initialState = {
  personal_info: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    phone_country: "et",
    dob: "",
    address: ""
  },
  course_details: {
    has_experience: null,
    program_type: "",
    vip_preference: ""
  },
  emergency: {
    contact_name: "",
    contact_phone: "",
    contact_phone_country: "et"
  },
  meta: {
    motivation: "",
    source: ""
  }
};

const STORAGE_KEY = "kalab_registration_progress";

function mergeFormData(savedFormData = {}) {
  return {
    personal_info: {
      ...initialState.personal_info,
      ...(savedFormData.personal_info || {}),
      phone_country: normalizeCountryCode(
        savedFormData.personal_info?.phone_country || "et"
      )
    },
    course_details: {
      ...initialState.course_details,
      ...(savedFormData.course_details || {})
    },
    emergency: {
      ...initialState.emergency,
      ...(savedFormData.emergency || {}),
      contact_phone_country: normalizeCountryCode(
        savedFormData.emergency?.contact_phone_country || "et"
      )
    },
    meta: {
      ...initialState.meta,
      ...(savedFormData.meta || {})
    }
  };
}

function replaceStepErrors(previousErrors, step, nextErrors) {
  const stepFields = STEP_FIELDS[step] || [];

  return {
    ...Object.fromEntries(
      Object.entries(previousErrors).filter(([field]) => !stepFields.includes(field))
    ),
    ...nextErrors
  };
}

function markStepFieldsTouched(previousTouched, step) {
  const stepFields = STEP_FIELDS[step] || [];
  const additions = Object.fromEntries(stepFields.map((field) => [field, true]));

  return {
    ...previousTouched,
    ...additions
  };
}

function useRegistrationForm(t) {
  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          formData: mergeFormData(parsed.formData),
          currentStep: parsed.currentStep || 1
        };
      }
    } catch (error) {
      console.error("Error loading saved progress:", error);
    }

    return { formData: initialState, currentStep: 1 };
  };

  const { formData: savedFormData, currentStep: savedCurrentStep } = loadSavedProgress();
  const [formData, setFormData] = useState(savedFormData);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [validatedSteps, setValidatedSteps] = useState({});
  const [currentStep, setCurrentStep] = useState(savedCurrentStep);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const savedStep = useMemo(() => currentStep, [currentStep]);

  useEffect(() => {
    if (!isSuccess && !submitting) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formData,
          currentStep: savedStep,
          timestamp: Date.now()
        })
      );
    }
  }, [formData, savedStep, isSuccess, submitting]);

  useEffect(() => {
    if (isSuccess) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isSuccess]);

  useEffect(() => {
    setFormData((prevFormData) => {
      const personalPhone =
        prevFormData.personal_info.phone ||
        getCountryDialCode(prevFormData.personal_info.phone_country);
      const emergencyPhone =
        prevFormData.emergency.contact_phone ||
        getCountryDialCode(prevFormData.emergency.contact_phone_country);

      const nextPersonalPhone = normalizePhoneInput(
        personalPhone,
        prevFormData.personal_info.phone_country,
      );
      const nextEmergencyPhone = normalizePhoneInput(
        emergencyPhone,
        prevFormData.emergency.contact_phone_country,
      );

      if (
        nextPersonalPhone === prevFormData.personal_info.phone &&
        nextEmergencyPhone === prevFormData.emergency.contact_phone
      ) {
        return prevFormData;
      }

      return {
        ...prevFormData,
        personal_info: {
          ...prevFormData.personal_info,
          phone: nextPersonalPhone,
        },
        emergency: {
          ...prevFormData.emergency,
          contact_phone: nextEmergencyPhone,
        },
      };
    });
  }, []);

  const updateSection = (section, field, value, options = {}) => {
    let nextTouchedFields = touchedFields;

    setTouchedFields((prevTouchedFields) => {
      nextTouchedFields = options.markTouched
        ? { ...prevTouchedFields, [field]: true }
        : prevTouchedFields;
      return nextTouchedFields;
    });

    let nextFormData;
    setFormData((prevFormData) => {
      nextFormData = {
        ...prevFormData,
        [section]: {
          ...prevFormData[section],
          [field]: value
        }
      };
      return nextFormData;
    });

    const step = FIELD_TO_STEP[field];
    const shouldValidateFullStep = Boolean(step) && validatedSteps[step];
    const shouldValidateField =
      Boolean(step) && (nextTouchedFields[field] || options.markTouched);

    if (shouldValidateFullStep) {
      const nextStepErrors = validateStep(step, nextFormData, t);
      setErrors((prev) => replaceStepErrors(prev, step, nextStepErrors));
      return;
    }

    if (shouldValidateField) {
      const nextFieldError = validateField(field, nextFormData, t);
      setErrors((prev) => ({
        ...prev,
        [field]: nextFieldError
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));
  };

  const markFieldTouched = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    const nextFieldError = validateField(field, formData, t);
    setErrors((prev) => ({
      ...prev,
      [field]: nextFieldError
    }));
  };

  const validateCurrentStep = () => {
    const nextErrors = validateStep(currentStep, formData, t);
    setValidatedSteps((prev) => ({ ...prev, [currentStep]: true }));
    setTouchedFields((prev) => markStepFieldsTouched(prev, currentStep));
    setErrors((prev) => replaceStepErrors(prev, currentStep, nextErrors));
    return Object.keys(nextErrors).length === 0;
  };

  const validateAllSteps = () => {
    let collectedErrors = {};

    [1, 2, 3].forEach((step) => {
      collectedErrors = {
        ...collectedErrors,
        ...validateStep(step, formData, t)
      };
    });

    setValidatedSteps({ 1: true, 2: true, 3: true });
    setTouchedFields((prev) =>
      [1, 2, 3].reduce((accumulator, step) => markStepFieldsTouched(accumulator, step), prev)
    );
    setErrors(collectedErrors);
    return Object.keys(collectedErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return false;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
    return true;
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    if (step < 1 || step > 3) {
      return false;
    }

    if (step >= currentStep) {
      return step === currentStep ? true : nextStep();
    }

    setCurrentStep(step);
    return true;
  };

  const resetFeedback = () => {
    setSubmitError("");
  };

  return {
    formData,
    errors,
    touchedFields,
    currentStep,
    submitting,
    submitError,
    isSuccess,
    setSubmitting,
    setSubmitError,
    setIsSuccess,
    updateSection,
    nextStep,
    previousStep,
    goToStep,
    validateCurrentStep,
    validateAllSteps,
    markFieldTouched,
    resetFeedback
  };
}

export default useRegistrationForm;
