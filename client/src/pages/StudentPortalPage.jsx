import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppBackdrop from "../components/AppBackdrop";
import useApplicantStatus from "../hooks/useApplicantStatus";
import useTelegramWebApp from "../hooks/useTelegramWebApp";
import {
  formatCurrency,
  formatDate,
  formatScheduleSummary
} from "../utils/formatters";

function StudentPortalPage() {
  const navigate = useNavigate();
  const { telegramUser } = useTelegramWebApp();
  const { applicant, isRegistered, loading, error } = useApplicantStatus(
    telegramUser.id
  );

  if (loading) {
    return (
      <AppBackdrop>
        <div className="flex min-h-screen items-center justify-center text-coffee-text">
          Loading student portal...
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
              Portal Locked
            </h1>
            <p className="mt-4 text-sm leading-7 text-coffee-muted">
              {error || "Complete your registration first to unlock the student portal."}
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

  const hasPaid = applicant.payment_status === "paid";
  const hasSchedule = Boolean(applicant.assigned_schedule);

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
                Student Portal
              </p>
              <h1 className="mt-2 font-display text-5xl font-semibold text-coffee-text">
                Welcome, {applicant.personal_info.first_name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-muted">
                Your admissions, payment, and class readiness details live here.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl border border-coffee-border bg-white/5 px-5 py-3 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
            >
              Back to Home
            </button>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <section className="glass-card rounded-[30px] p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-coffee-border bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                      Payment Status
                    </p>
                    <p className="mt-4 text-2xl font-semibold text-coffee-text">
                      {hasPaid ? "Paid" : "Pending"}
                    </p>
                    <p className="mt-2 text-sm text-coffee-muted">
                      {hasPaid
                        ? "Your seat is financially confirmed."
                        : "Waiting for payment approval."}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-coffee-border bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                      Interest Status
                    </p>
                    <p className="mt-4 text-2xl font-semibold text-coffee-text">
                      {applicant.interest_status === "interested"
                        ? "Interested"
                        : "Not Interested"}
                    </p>
                    <p className="mt-2 text-sm text-coffee-muted">
                      Only interested applicants receive payment requests and reminders.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-coffee-border bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                      Outstanding Fee
                    </p>
                    <p className="mt-4 text-2xl font-semibold text-coffee-text">
                      {formatCurrency(applicant.price)}
                    </p>
                    <p className="mt-2 text-sm text-coffee-muted">
                      Confirmation happens after your screenshot review.
                    </p>
                  </div>
                </div>
              </section>

              <section className="glass-card rounded-[30px] p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                  Class Readiness
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-coffee-text">
                  {hasPaid ? "Your training overview" : "Waiting for payment"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-coffee-muted">
                  {hasPaid
                    ? "Your schedule details will appear below once a cohort is assigned."
                    : "Once payment is approved, your assigned cohort and start date will unlock here."}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-coffee-border bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                      Schedule
                    </p>
                    <p className="mt-3 text-lg font-semibold text-coffee-text">
                      {hasPaid && hasSchedule
                        ? formatScheduleSummary(applicant.assigned_schedule)
                        : "Waiting for assignment"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-coffee-border bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                      Start Date
                    </p>
                    <p className="mt-3 text-lg font-semibold text-coffee-text">
                      {hasPaid && hasSchedule
                        ? formatDate(applicant.assigned_schedule.start_date)
                        : "Waiting for payment"}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="glass-card rounded-[30px] p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                  Quick Actions
                </p>
                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full rounded-2xl border border-coffee-border bg-white/5 px-4 py-3 text-left text-sm font-semibold text-coffee-text transition hover:bg-white/10"
                  >
                    Manage profile
                  </button>
                  <button
                    onClick={() => navigate("/courses")}
                    className="w-full rounded-2xl border border-coffee-border bg-white/5 px-4 py-3 text-left text-sm font-semibold text-coffee-text transition hover:bg-white/10"
                  >
                    Review course path
                  </button>
                </div>
              </section>

              <section className="glass-card rounded-[30px] p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                  Telegram Notes
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-coffee-muted">
                  <li>Your registration confirmation is sent through the bot.</li>
                  <li>Payment screenshots should be uploaded directly in the Telegram chat.</li>
                  <li>Class details are sent automatically after payment approval and schedule assignment.</li>
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppBackdrop>
  );
}

export default StudentPortalPage;
