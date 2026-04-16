import { useState, useEffect } from "react";
import { validateStep } from "../utils/validators";

const initialState = {
  personal_info: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    address: ""
  },
  course_details: {
    has_experience: null,
    program_type: "Regular",
    vip_preference: ""
  },
  emergency: {
    contact_name: "",
    contact_phone: ""
  },
  meta: {
    motivation: "",
    source: ""
  }
};

const STORAGE_KEY = "kalab_registration_progress";

function useRegistrationForm() {
  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          formData: { ...initialState, ...parsed.formData },
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
  const [currentStep, setCurrentStep] = useState(savedCurrentStep);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Save progress to localStorage whenever form data or step changes
  useEffect(() => {
    if (!isSuccess && !submitting) {
      const progress = {
        formData,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [formData, currentStep, isSuccess, submitting]);

  // Clear saved progress on successful submission
  useEffect(() => {
    if (isSuccess) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isSuccess]);

  // Clear errors when step changes
  useEffect(() => {
    setErrors({});
  }, [currentStep]);

  const updateSection = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));
  };

  const validateCurrentStep = () => {
    const nextErrors = validateStep(currentStep, formData);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return false;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
    setErrors({}); // Clear all errors when moving to next step
    return true;
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({}); // Clear all errors when moving to previous step
  };

  const resetFeedback = () => {
    setSubmitError("");
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    errors,
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
    validateCurrentStep,
    resetFeedback,
    clearErrors
  };
}

export default useRegistrationForm;
