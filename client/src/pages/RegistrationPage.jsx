import { AnimatePresence, motion } from "framer-motion";
import CustomSelect from "../components/CustomSelect";
import DatePicker from "../components/DatePicker";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import FormShell from "../components/FormShell";
import FormTextarea from "../components/FormTextarea";
import ProgramCard from "../components/ProgramCard";
import StepIndicator from "../components/StepIndicator";
import SuccessState from "../components/SuccessState";
import ToggleGroup from "../components/ToggleGroup";
import useRegistrationForm from "../hooks/useRegistrationForm";
import useTelegramWebApp from "../hooks/useTelegramWebApp";
import { submitRegistration } from "../utils/api";
import { scheduleOptions, sourceOptions } from "../utils/options";
import { normalizeSubmission } from "../utils/validators";

const stepTitles = ["Profile", "Program", "Finish"];

const sectionMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.24, ease: "easeOut" },
};

function RegistrationPage() {
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
    validateCurrentStep,
    resetFeedback,
  } = useRegistrationForm();

  const { telegramUser, haptic } = useTelegramWebApp();

  const handleNext = () => {
    resetFeedback();
    const advanced = nextStep();

    if (advanced) {
      haptic("light");
    } else {
      haptic("rigid");
    }
  };

  const handlePrevious = () => {
    resetFeedback();
    previousStep();
    haptic("light");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!validateCurrentStep()) {
      haptic("rigid");
      return;
    }

    const payload = normalizeSubmission(formData, telegramUser);

    try {
      setSubmitting(true);
      await submitRegistration(payload);
      setIsSuccess(true);
      haptic("medium");

      // Remove auto-close to let user choose to go home
      // window.setTimeout(() => {
      //   closeApp();
      // }, 1600);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "We could not submit your registration right now. Please try again.";
      setSubmitError(message);
      haptic("rigid");
    } finally {
      setSubmitting(false);
    }
  };

  const isVip = formData.course_details.program_type === "VIP";

  return (
    <FormShell telegramUser={telegramUser} showNav>
      {isSuccess ? (
        <SuccessState />
      ) : (
        <form onSubmit={handleSubmit}>
          <StepIndicator
            currentStep={currentStep}
            totalSteps={3}
            titles={stepTitles}
          />

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step-1" {...sectionMotion} className="space-y-4">
                <FormInput
                  id="first_name"
                  label="First name"
                  placeholder="Abeba"
                  value={formData.personal_info.first_name}
                  onChange={(event) =>
                    updateSection(
                      "personal_info",
                      "first_name",
                      event.target.value,
                    )
                  }
                  error={errors.first_name}
                />
                <FormInput
                  id="last_name"
                  label="Last name"
                  placeholder="Bekele"
                  value={formData.personal_info.last_name}
                  onChange={(event) =>
                    updateSection(
                      "personal_info",
                      "last_name",
                      event.target.value,
                    )
                  }
                  error={errors.last_name}
                />
                <FormInput
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={formData.personal_info.email}
                  onChange={(event) =>
                    updateSection("personal_info", "email", event.target.value)
                  }
                  error={errors.email}
                />
                <FormInput
                  id="phone"
                  type="tel"
                  label="Phone number"
                  placeholder="0912345678"
                  hint="Accepted formats: 0912345678 or +251912345678"
                  value={formData.personal_info.phone}
                  onChange={(event) =>
                    updateSection("personal_info", "phone", event.target.value)
                  }
                  error={errors.phone}
                />
                <DatePicker
                  id="dob"
                  label="Date of birth"
                  value={formData.personal_info.dob}
                  onChange={(event) =>
                    updateSection("personal_info", "dob", event.target.value)
                  }
                  error={errors.dob}
                />
                <FormInput
                  id="address"
                  label="Address"
                  placeholder="Addis Ababa, Bole"
                  value={formData.personal_info.address}
                  onChange={(event) =>
                    updateSection(
                      "personal_info",
                      "address",
                      event.target.value,
                    )
                  }
                  error={errors.address}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step-2" {...sectionMotion} className="space-y-4">
                <ToggleGroup
                  label="Do you already have barista experience?"
                  value={formData.course_details.has_experience}
                  onChange={(value) =>
                    updateSection("course_details", "has_experience", value)
                  }
                  options={[
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ]}
                  error={errors.has_experience}
                />

                <div>
                  <span className="mb-2 block text-sm font-medium text-coffee-text">
                    Program type
                  </span>
                  <div className="space-y-3">
                    <ProgramCard
                      title="Regular"
                      description="A focused academy experience with structured weekday training."
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
                      title="VIP"
                      description="Premium scheduling flexibility with priority support and smaller sessions."
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
                    label="Preferred VIP schedule"
                    value={formData.course_details.vip_preference}
                    onChange={(event) =>
                      updateSection(
                        "course_details",
                        "vip_preference",
                        event.target.value,
                      )
                    }
                    options={scheduleOptions}
                    placeholder="Choose a schedule"
                    error={errors.vip_preference}
                  />
                ) : null}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step-3" {...sectionMotion} className="space-y-4">
                <FormInput
                  id="contact_name"
                  label="Emergency contact name"
                  placeholder="Meseret Tesfaye"
                  value={formData.emergency.contact_name}
                  onChange={(event) =>
                    updateSection(
                      "emergency",
                      "contact_name",
                      event.target.value,
                    )
                  }
                  error={errors.contact_name}
                />
                <FormInput
                  id="contact_phone"
                  type="tel"
                  label="Emergency contact phone"
                  placeholder="0911223344"
                  value={formData.emergency.contact_phone}
                  onChange={(event) =>
                    updateSection(
                      "emergency",
                      "contact_phone",
                      event.target.value,
                    )
                  }
                  error={errors.contact_phone}
                />
                <FormTextarea
                  id="motivation"
                  label="Why do you want to join the academy?"
                  placeholder="Share your goals, interest in coffee, and what you hope to learn."
                  value={formData.meta.motivation}
                  onChange={(event) =>
                    updateSection("meta", "motivation", event.target.value)
                  }
                  error={errors.motivation}
                />
                <CustomSelect
                  id="source"
                  label="How did you hear about us?"
                  value={formData.meta.source}
                  onChange={(event) =>
                    updateSection("meta", "source", event.target.value)
                  }
                  options={sourceOptions}
                  placeholder="Select a source"
                  error={errors.source}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {submitError ? (
            <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            {currentStep > 1 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handlePrevious}
                className="flex-1 rounded-2xl border border-coffee-border bg-coffee-bg/60 px-4 py-3 text-sm font-semibold text-coffee-text"
              >
                Back
              </motion.button>
            ) : null}

            {currentStep < 3 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex-1 rounded-2xl bg-coffee-accent px-4 py-3 text-sm font-bold text-coffee-bg shadow-soft"
              >
                Continue
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-coffee-accent px-4 py-3 text-sm font-bold text-coffee-bg shadow-soft disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </motion.button>
            )}
          </div>
        </form>
      )}
    </FormShell>
  );
}

export default RegistrationPage;
