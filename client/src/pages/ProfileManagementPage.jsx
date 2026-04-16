import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBackdrop from "../components/AppBackdrop";
import useApplicantStatus from "../hooks/useApplicantStatus";
import useTelegramWebApp from "../hooks/useTelegramWebApp";
import { updateStudentProfile } from "../utils/api";
import {
  formatCurrency,
  formatDate,
  formatScheduleSummary
} from "../utils/formatters";

function ProfileManagementPage() {
  const navigate = useNavigate();
  const { telegramUser } = useTelegramWebApp();
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
        requestError.response?.data?.message ||
          "We could not save your profile updates right now."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppBackdrop>
        <div className="flex min-h-screen items-center justify-center text-coffee-text">
          Loading profile...
        </div>
      </AppBackdrop>
    );
  }

  if (!isRegistered) {
    return (
      <AppBackdrop>
        <div className="px-4 py-8">
          <div className="mx-auto max-w-xl glass-card rounded-[28px] p-8 text-center">
            <h1 className="font-display text-4xl font-semibold text-coffee-text">
              Profile Locked
            </h1>
            <p className="mt-4 text-sm leading-7 text-coffee-muted">
              {error || "Register first to manage your details."}
            </p>
            <button
              onClick={() => navigate("/register")}
              className="premium-button mt-6 rounded-2xl px-6 py-3 text-sm font-bold text-coffee-bg"
            >
              Go to Registration
            </button>
          </div>
        </div>
      </AppBackdrop>
    );
  }

  return (
    <AppBackdrop>
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                Profile Management
              </p>
              <h1 className="mt-2 font-display text-5xl font-semibold text-coffee-text">
                Keep your profile current
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/portal")}
                className="rounded-2xl border border-coffee-border bg-white/5 px-5 py-3 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
              >
                Back to Portal
              </button>
              {!editMode ? (
                <button
                  onClick={handleStartEdit}
                  className="premium-button rounded-2xl px-5 py-3 text-sm font-bold text-coffee-bg"
                >
                  Edit Profile
                </button>
              ) : null}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <section className="glass-card rounded-[30px] p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["First Name", "personal_info", "first_name"],
                  ["Last Name", "personal_info", "last_name"],
                  ["Email", "personal_info", "email"],
                  ["Phone", "personal_info", "phone"],
                  ["Address", "personal_info", "address"],
                  ["Emergency Contact", "emergency", "contact_name"],
                  ["Emergency Phone", "emergency", "contact_phone"],
                  ["Motivation", "meta", "motivation"]
                ].map(([label, section, field]) => (
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
                          className="field-ring mt-3 min-h-[120px] w-full rounded-2xl border border-coffee-border bg-white/5 px-4 py-3 text-sm text-coffee-text outline-none focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/20"
                        />
                      ) : (
                        <input
                          value={formData?.[section]?.[field] || ""}
                          onChange={(event) =>
                            handleInputChange(section, field, event.target.value)
                          }
                          className="field-ring mt-3 w-full rounded-2xl border border-coffee-border bg-white/5 px-4 py-3 text-sm text-coffee-text outline-none focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/20"
                        />
                      )
                    ) : (
                      <p className="mt-3 text-sm leading-7 text-coffee-text">
                        {applicant?.[section]?.[field] || "Not provided"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {saveError ? (
                <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {saveError}
                </div>
              ) : null}

              {editMode ? (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="premium-button rounded-2xl px-5 py-3 text-sm font-bold text-coffee-bg disabled:opacity-60"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="rounded-2xl border border-coffee-border bg-white/5 px-5 py-3 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </section>

            <aside className="space-y-6">
              <section className="glass-card rounded-[30px] p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                  Enrollment Snapshot
                </p>
                <div className="mt-5 space-y-4 text-sm text-coffee-muted">
                  <div className="flex items-center justify-between gap-4">
                    <span>Program</span>
                    <span className="text-coffee-text">
                      {applicant.course_details.program_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Payment</span>
                    <span className="text-coffee-text">{applicant.payment_status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Fee</span>
                    <span className="text-coffee-text">
                      {formatCurrency(applicant.price)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                      Schedule
                    </span>
                    <p className="mt-2 text-coffee-text">
                      {formatScheduleSummary(applicant.assigned_schedule)}
                    </p>
                    <p className="mt-2 text-coffee-muted">
                      Start date: {formatDate(applicant.assigned_schedule?.start_date)}
                    </p>
                  </div>
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
