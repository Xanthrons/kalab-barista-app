import { AnimatePresence, motion } from "framer-motion";
import IntlTelInput from "intl-tel-input/reactWithUtils";
import { useEffect, useMemo, useRef } from "react";
import BackButton from "../components/BackButton";
import CustomSelect from "../components/CustomSelect";
import DatePicker from "../components/DatePicker";
import FormInput from "../components/FormInput";
import FormShell from "../components/FormShell";
import FormTextarea from "../components/FormTextarea";
import ProgramCard from "../components/ProgramCard";
import StepIndicator from "../components/StepIndicator";
import SuccessState from "../components/SuccessState";
import ToggleGroup from "../components/ToggleGroup";
import useRegistrationForm from "../hooks/useRegistrationForm";
import useTelegramWebApp, {
  useAppPreferences,
} from "../hooks/useTelegramWebApp";
import { submitRegistration } from "../utils/api";
import {
  getCountryDialCode,
  normalizeCountryCode,
  normalizePhoneInput,
  normalizeSubmission,
  sanitizeNameInput,
  validateStep,
} from "../utils/validators";

const sectionMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.24, ease: "easeOut" },
};

const STEP_FOCUS_TARGETS = {
  1: "first_name",
  2: "experience-true",
  3: "contact_name",
};

function PhoneField({
  id,
  label,
  required,
  country,
  value,
  error,
  hint,
  onCountryChange,
  onValueChange,
  onBlur,
}) {
  const itiRef = useRef(null);
  const handleBlur = () => {
    const instance = itiRef.current?.getInstance?.();
    const inputElement = itiRef.current?.getInput?.();
    const rawValue = inputElement?.value ?? value;
    const nextCountry = instance?.getSelectedCountryData?.()?.iso2 || country;

    onBlur(rawValue, normalizeCountryCode(nextCountry));
  };

  return (
    <div className="block">
      <span className="mb-2 block text-sm font-medium text-coffee-text">
        {label}
        {required ? <span className="ml-1 text-coffee-accent">*</span> : null}
      </span>

      <IntlTelInput
        ref={itiRef}
        value={value}
        initialCountry={country}
        nationalMode={false}
        formatAsYouType
        formatOnDisplay
        countrySearch
        useFullscreenPopup={false}
        fixDropdownWidth={false}
        onChangeNumber={(nextValue) => onValueChange(nextValue || "")}
        onChangeCountry={(nextCountry) => {
          const selectedCountryData = itiRef.current
            ?.getInstance?.()
            ?.getSelectedCountryData?.();
          const inputElement = itiRef.current?.getInput?.();
          const nextDialCode = selectedCountryData?.dialCode
            ? `+${selectedCountryData.dialCode}`
            : getCountryDialCode(nextCountry);

          onCountryChange(
            normalizeCountryCode(nextCountry),
            nextDialCode,
            inputElement?.value ?? value,
          );
        }}
        containerClass="phone-field w-full"
        searchInputClass="phone-search-input"
        inputProps={{
          id,
          name: id,
          autoComplete: "tel",
          onBlur: handleBlur,
          className: `field-ring w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-sm text-coffee-text outline-none transition placeholder:text-coffee-muted/50 focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/25 ${
            error ? "border-red-400/70" : "border-coffee-border"
          }`,
        }}
      />

      {hint ? (
        <span className="mt-2 block text-xs text-coffee-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-2 block text-xs text-red-300">{error}</span>
      ) : null}
    </div>
  );
}

function RegistrationPage() {
  const { telegramUser, haptic } = useTelegramWebApp();
  const { t } = useAppPreferences();
  const formRef = useRef(null);
  const {
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
    goToStep,
    validateAllSteps,
    markFieldTouched,
    resetFeedback,
  } = useRegistrationForm(t);

  const stepTitles = useMemo(
    () => [t("profileStep"), t("programStep"), t("finishStep")],
    [t],
  );

  const scheduleOptions = useMemo(
    () => [
      { label: t("morning"), value: "Morning" },
      { label: t("afternoon"), value: "Afternoon" },
      { label: t("weekend"), value: "Weekend" },
    ],
    [t],
  );

  const sourceOptions = useMemo(
    () => [
      { label: t("instagram"), value: "Instagram" },
      { label: t("telegram"), value: "Telegram" },
      { label: t("referral"), value: "Referral" },
    ],
    [t],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNameChange = (section, field) => (event) => {
    updateSection(section, field, sanitizeNameInput(event.target.value));
  };

  const handlePhoneValueChange = (section, field) => (nextValue) => {
    updateSection(section, field, nextValue);
  };

  const handlePhoneCountryChange =
    (section, field, countryField) => (nextCountry, nextDialCode, rawValue) => {
      const previousCountry = formData[section][countryField] || "et";
      const previousDialCode = getCountryDialCode(previousCountry);
      const currentValue = rawValue || formData[section][field] || "";
      let nextValue = currentValue;

      if (currentValue.startsWith(previousDialCode)) {
        nextValue = `${nextDialCode}${currentValue.slice(previousDialCode.length)}`;
      }

      updateSection(section, countryField, normalizeCountryCode(nextCountry));
      updateSection(
        section,
        field,
        normalizePhoneInput(nextValue, normalizeCountryCode(nextCountry)),
      );
    };

  const handlePhoneBlur =
    (section, field, countryField) => (rawValue, nextCountry) => {
      const country = nextCountry || formData[section][countryField] || "et";
      updateSection(section, countryField, country);
      updateSection(section, field, normalizePhoneInput(rawValue, country), {
        markTouched: true,
      });
    };

  const handleNext = () => {
    resetFeedback();
    const advanced = nextStep();
    haptic(advanced ? "light" : "rigid");
  };

  const handlePrevious = () => {
    resetFeedback();
    previousStep();
    haptic("light");
  };

  const handleStepSelect = (step) => {
    resetFeedback();
    const moved = goToStep(step);
    haptic(moved ? "light" : "rigid");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!validateAllSteps()) {
      const invalidStep = [1, 2, 3].find(
        (step) => Object.keys(validateStep(step, formData, t)).length > 0,
      );

      if (invalidStep) {
        goToStep(invalidStep);
      }

      haptic("rigid");
      return;
    }

    try {
      setSubmitting(true);
      await submitRegistration(normalizeSubmission(formData, telegramUser));
      setIsSuccess(true);
      haptic("medium");
    } catch (error) {
      setSubmitError(error.response?.data?.message || t("submitError"));
      haptic("rigid");
    } finally {
      setSubmitting(false);
    }
  };

  const isVip = formData.course_details.program_type === "VIP";

  return (
    <FormShell telegramUser={telegramUser}>
      {isSuccess ? (
        <SuccessState />
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="mb-6 flex items-center justify-between gap-4">
            <BackButton to="/" label={t("home")} />
            <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
              {t("registration")}
            </p>
          </div>

          <StepIndicator
            currentStep={currentStep}
            totalSteps={3}
            titles={stepTitles}
            onStepSelect={handleStepSelect}
          />

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div key="step-1" {...sectionMotion} className="space-y-4">
                <FormInput
                  id="first_name"
                  label={t("firstName")}
                  required
                  placeholder={t("firstName")}
                  value={formData.personal_info.first_name}
                  onChange={handleNameChange("personal_info", "first_name")}
                  onBlur={() => markFieldTouched("first_name")}
                  error={errors.first_name}
                />

                <FormInput
                  id="last_name"
                  label={t("lastName")}
                  required
                  placeholder={t("lastName")}
                  value={formData.personal_info.last_name}
                  onChange={handleNameChange("personal_info", "last_name")}
                  onBlur={() => markFieldTouched("last_name")}
                  error={errors.last_name}
                />

                <FormInput
                  id="email"
                  type="email"
                  label={t("emailAddress")}
                  placeholder="you@example.com"
                  value={formData.personal_info.email}
                  onChange={(event) =>
                    updateSection("personal_info", "email", event.target.value)
                  }
                  onBlur={() => markFieldTouched("email")}
                  error={errors.email}
                />

                <PhoneField
                  id="phone"
                  label={t("phoneNumber")}
                  required
                  country={formData.personal_info.phone_country}
                  value={formData.personal_info.phone}
                  hint={t("phoneHint", {
                    example: getCountryDialCode(
                      formData.personal_info.phone_country,
                    ),
                  })}
                  error={errors.phone}
                  onCountryChange={handlePhoneCountryChange(
                    "personal_info",
                    "phone",
                    "phone_country",
                  )}
                  onValueChange={handlePhoneValueChange(
                    "personal_info",
                    "phone",
                  )}
                  onBlur={handlePhoneBlur(
                    "personal_info",
                    "phone",
                    "phone_country",
                  )}
                />

                <DatePicker
                  id="dob"
                  label={t("dateOfBirth")}
                  required
                  value={formData.personal_info.dob}
                  onChange={(event) =>
                    updateSection("personal_info", "dob", event.target.value)
                  }
                  onBlur={() => markFieldTouched("dob")}
                  error={errors.dob}
                  hint={t("dateHint")}
                />

                <FormInput
                  id="address"
                  label={t("address")}
                  required
                  placeholder={t("address")}
                  value={formData.personal_info.address}
                  onChange={(event) =>
                    updateSection(
                      "personal_info",
                      "address",
                      event.target.value,
                    )
                  }
                  onBlur={() => markFieldTouched("address")}
                  error={errors.address}
                />
              </motion.div>
            ) : null}

            {currentStep === 2 ? (
              <motion.div key="step-2" {...sectionMotion} className="space-y-4">
                <ToggleGroup
                  idPrefix="experience"
                  label={t("experienceQuestion")}
                  required
                  value={formData.course_details.has_experience}
                  onChange={(value) =>
                    updateSection("course_details", "has_experience", value)
                  }
                  onBlur={() => markFieldTouched("has_experience")}
                  options={[
                    { label: t("yes"), value: true },
                    { label: t("no"), value: false },
                  ]}
                  error={errors.has_experience}
                />

                <div>
                  <span className="mb-2 block text-sm font-medium text-coffee-text">
                    {t("programType")}
                    <span className="ml-1 text-red-500">*</span>
                  </span>

                  <div className="space-y-3">
                    <ProgramCard
                      title={t("regular")}
                      description={t("regularDescription")}
                      active={
                        formData.course_details.program_type === "Regular"
                      }
                      onClick={() => {
                        updateSection(
                          "course_details",
                          "program_type",
                          "Regular",
                        );
                        updateSection("course_details", "vip_preference", "");
                      }}
                    />
                    <ProgramCard
                      title={t("vip")}
                      description={t("vipDescription")}
                      active={formData.course_details.program_type === "VIP"}
                      onClick={() =>
                        updateSection("course_details", "program_type", "VIP")
                      }
                    />
                  </div>

                  {errors.program_type ? (
                    <span className="mt-2 block text-xs text-red-300">
                      {errors.program_type}
                    </span>
                  ) : null}
                </div>

                {isVip ? (
                  <CustomSelect
                    id="vip_preference"
                    label={t("preferredVipSchedule")}
                    required
                    value={formData.course_details.vip_preference}
                    onChange={(event) =>
                      updateSection(
                        "course_details",
                        "vip_preference",
                        event.target.value,
                      )
                    }
                    options={scheduleOptions}
                    placeholder={t("chooseSchedule")}
                    onBlur={() => markFieldTouched("vip_preference")}
                    error={errors.vip_preference}
                  />
                ) : null}
              </motion.div>
            ) : null}

            {currentStep === 3 ? (
              <motion.div key="step-3" {...sectionMotion} className="space-y-4">
                <FormInput
                  id="contact_name"
                  label={t("emergencyContactName")}
                  placeholder={t("emergencyContactName")}
                  value={formData.emergency.contact_name}
                  onChange={handleNameChange("emergency", "contact_name")}
                  onBlur={() => markFieldTouched("contact_name")}
                  error={errors.contact_name}
                />

                <PhoneField
                  id="contact_phone"
                  label={t("emergencyContactPhone")}
                  country={formData.emergency.contact_phone_country}
                  value={formData.emergency.contact_phone}
                  hint={t("phoneHint", {
                    example: getCountryDialCode(
                      formData.emergency.contact_phone_country,
                    ),
                  })}
                  error={errors.contact_phone}
                  onCountryChange={handlePhoneCountryChange(
                    "emergency",
                    "contact_phone",
                    "contact_phone_country",
                  )}
                  onValueChange={handlePhoneValueChange(
                    "emergency",
                    "contact_phone",
                  )}
                  onBlur={handlePhoneBlur(
                    "emergency",
                    "contact_phone",
                    "contact_phone_country",
                  )}
                />

                <FormTextarea
                  id="motivation"
                  label={t("motivationLabel")}
                  placeholder={t("motivationPlaceholder")}
                  value={formData.meta.motivation}
                  maxLength={1000}
                  showCount
                  onChange={(event) =>
                    updateSection(
                      "meta",
                      "motivation",
                      event.target.value.slice(0, 1000),
                    )
                  }
                  onBlur={() => markFieldTouched("motivation")}
                  error={errors.motivation}
                />

                <CustomSelect
                  id="source"
                  label={t("sourceLabel")}
                  required
                  value={formData.meta.source}
                  onChange={(event) =>
                    updateSection("meta", "source", event.target.value)
                  }
                  options={sourceOptions}
                  placeholder={t("chooseSource")}
                  onBlur={() => markFieldTouched("source")}
                  error={errors.source}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {submitError ? (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {submitError}
            </div>
          ) : null}

          <p className="mt-5 text-xs text-coffee-muted/75">
            {t("requiredNotice")}
          </p>

          <div className="mt-6 flex items-center gap-3">
            {currentStep > 1 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handlePrevious}
                className="flex-1 rounded-xl border border-coffee-border bg-coffee-bg/60 px-4 py-3 text-sm font-semibold text-coffee-text"
              >
                {t("back")}
              </motion.button>
            ) : null}

            {currentStep < 3 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex-1 rounded-xl bg-coffee-accent px-4 py-3 text-sm font-bold text-coffee-bg shadow-soft"
              >
                {t("continue")}
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                className="flex-1 rounded-xl bg-coffee-accent px-4 py-3 text-sm font-bold text-coffee-bg shadow-soft disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? t("submitting") : t("submitApplication")}
              </motion.button>
            )}
          </div>
        </form>
      )}
    </FormShell>
  );
}

export default RegistrationPage;
