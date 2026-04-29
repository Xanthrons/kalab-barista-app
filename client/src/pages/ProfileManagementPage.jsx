import { motion } from "framer-motion";
import { useState } from "react";
import BackButton from "../components/BackButton";
import AppBackdrop from "../components/AppBackdrop";
import useApplicantStatus from "../hooks/useApplicantStatus";
import useTelegramWebApp, { useAppPreferences } from "../hooks/useTelegramWebApp";
import { updateStudentProfile } from "../utils/api";
import {
  formatCurrency,
  formatDate,
  formatScheduleSummary
} from "../utils/formatters";
import {
  formatPhoneDisplay,
  normalizePhoneInput,
  sanitizeNameInput
} from "../utils/validators";

function ProfileManagementPage() {
  const { telegramUser } = useTelegramWebApp();
  const { t } = useAppPreferences();
  const { applicant, isRegistered, loading, error, refresh } = useApplicantStatus(
    telegramUser.id
  );
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formData, setFormData] = useState(null);

  const handleStartEdit = () => {
    if (!applicant) {
      return;
    }

    setFormData({
      personal_info: { ...applicant.personal_info },
      emergency: { ...applicant.emergency },
      meta: { ...applicant.meta }
    });
    setSaveError("");
    setEditMode(true);
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!applicant) {
      return;
    }

    try {
      setUpdating(true);
      setSaveError("");
      await updateStudentProfile(applicant._id, formData);
      await refresh();
      setEditMode(false);
    } catch (requestError) {
      setSaveError(
        requestError.response?.data?.message || t("couldNotSaveProfile")
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppBackdrop>
        <div className="flex min-h-screen items-center justify-center text-coffee-text">
          {t("loadingProfile")}
        </div>
      </AppBackdrop>
    );
  }

  if (!isRegistered) {
    return (
      <AppBackdrop>
        <div className="px-4 py-8">
          <div className="mx-auto max-w-xl glass-card rounded-[24px] p-8 text-center">
            <h1 className="text-3xl font-extrabold text-coffee-text">
              {t("profileLocked")}
            </h1>
            <p className="mt-4 text-sm leading-7 text-coffee-muted">
              {error || t("registerFirstToManage")}
            </p>
            <div className="mt-6 flex justify-center">
              <BackButton to="/register" label={t("goToRegistration")} />
            </div>
          </div>
        </div>
      </AppBackdrop>
    );
  }

  const labels = [
    [t("firstName"), "personal_info", "first_name"],
    [t("lastName"), "personal_info", "last_name"],
    [t("emailAddress"), "personal_info", "email"],
    [t("phoneNumber"), "personal_info", "phone"],
    [t("address"), "personal_info", "address"],
    [t("emergencyContactName"), "emergency", "contact_name"],
    [t("emergencyContactPhone"), "emergency", "contact_phone"],
    [t("motivationLabel"), "meta", "motivation"]
  ];

  return (
    <AppBackdrop>
      <div className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                {t("profileManagement")}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold text-coffee-text">
                {t("manageYourProfile")}
              </h1>
            </div>
            <div className="flex gap-3">
              <BackButton to="/portal" label={t("studentPortal")} />
              {!editMode ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="premium-button rounded-xl px-5 py-3 text-sm font-bold text-coffee-bg"
                >
                  {t("editProfile")}
                </button>
              ) : null}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <section className="glass-card rounded-[24px] p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {labels.map(([label, section, field]) => (
                  <div key={field}>
                    <p className="text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                      {label}
                    </p>
                    {editMode ? (
                      field === "motivation" ? (
                        <textarea
                          value={formData?.[section]?.[field] || ""}
                          onChange={(event) =>
                            handleInputChange(section, field, event.target.value)
                          }
                          className="field-ring mt-3 min-h-[120px] w-full rounded-xl border border-coffee-border bg-white/5 px-4 py-3 text-sm text-coffee-text outline-none focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/20"
                        />
                      ) : (
                        <input
                          value={
                            field.includes("phone")
                              ? formatPhoneDisplay(formData?.[section]?.[field] || "")
                              : formData?.[section]?.[field] || ""
                          }
                          onChange={(event) =>
                            handleInputChange(
                              section,
                              field,
                              field === "phone"
                                ? normalizePhoneInput(event.target.value)
                                : field === "contact_phone"
                                  ? normalizePhoneInput(event.target.value, {
                                      allowEmpty: true
                                    })
                                  : field.includes("name")
                                    ? sanitizeNameInput(event.target.value)
                                    : event.target.value
                            )
                          }
                          className="field-ring mt-3 w-full rounded-xl border border-coffee-border bg-white/5 px-4 py-3 text-sm text-coffee-text outline-none focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/20"
                        />
                      )
                    ) : (
                      <p className="mt-3 text-sm leading-7 text-coffee-text">
                        {field.includes("phone")
                          ? applicant?.[section]?.[field] || t("notProvided")
                          : applicant?.[section]?.[field] || t("notProvided")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {saveError ? (
                <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {saveError}
                </div>
              ) : null}

              {editMode ? (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={updating}
                    className="premium-button rounded-xl px-5 py-3 text-sm font-bold text-coffee-bg disabled:opacity-60"
                  >
                    {updating ? t("saving") : t("saveChanges")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="rounded-xl border border-coffee-border bg-white/5 px-5 py-3 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
                  >
                    {t("cancel")}
                  </button>
                </div>
              ) : null}
            </section>

            <aside className="space-y-6">
              <section className="glass-card rounded-[24px] p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                  {t("enrollmentSnapshot")}
                </p>
                <div className="mt-5 space-y-4 text-sm text-coffee-muted">
                  <div className="flex items-center justify-between gap-4">
                    <span>{t("program")}</span>
                    <span className="text-coffee-text">
                      {applicant.course_details.program_type === "VIP"
                        ? t("vip")
                        : t("regular")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>{t("paymentStatus")}</span>
                    <span className="text-coffee-text">
                      {applicant.payment_status === "paid" ? t("paid") : t("pending")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>{t("fee")}</span>
                    <span className="text-coffee-text">
                      {formatCurrency(applicant.price)}
                    </span>
                  </div>
                  {applicant.payment_status === "paid" ? (
                    <div>
                      <span className="block text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                        {t("schedule")}
                      </span>
                      <p className="mt-2 text-coffee-text">
                        {formatScheduleSummary(applicant.assigned_schedule)}
                      </p>
                      <p className="mt-2 text-coffee-muted">
                        {t("startDate")}: {formatDate(applicant.assigned_schedule?.start_date)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppBackdrop>
  );
}

export default ProfileManagementPage;
