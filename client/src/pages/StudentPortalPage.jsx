import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import AppBackdrop from "../components/AppBackdrop";
import useApplicantStatus from "../hooks/useApplicantStatus";
import useTelegramWebApp, { useAppPreferences } from "../hooks/useTelegramWebApp";
import {
  formatCurrency,
  formatDate,
  formatScheduleSummary
} from "../utils/formatters";

function StudentPortalPage() {
  const { telegramUser } = useTelegramWebApp();
  const { t } = useAppPreferences();
  const { applicant, isRegistered, loading, error } = useApplicantStatus(
    telegramUser.id
  );

  if (loading) {
    return (
      <AppBackdrop>
        <div className="flex min-h-screen items-center justify-center text-coffee-text">
          {t("loadingStudentPortal")}
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
              {t("portalLocked")}
            </h1>
            <p className="mt-4 text-sm leading-7 text-coffee-muted">
              {error || t("completeRegistrationFirst")}
            </p>
            <div className="mt-6 flex justify-center">
              <BackButton to="/register" label={t("goToRegistration")} />
            </div>
          </div>
        </div>
      </AppBackdrop>
    );
  }

  const hasPaid = applicant.payment_status === "paid";
  const hasSchedule = Boolean(applicant.assigned_schedule);
  const welcomeName =
    telegramUser.first_name || applicant.personal_info.first_name || t("student");

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
                {t("studentPortal")}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold text-coffee-text">
                {t("welcomeNamed", { name: welcomeName })}
              </h1>
            </div>
            <BackButton to="/" label={t("home")} />
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            <section className="glass-card rounded-[24px] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                {t("paymentStatus")}
              </p>
              <p className="mt-4 text-2xl font-semibold text-coffee-text">
                {hasPaid ? t("paid") : t("pending")}
              </p>
              <p className="mt-2 text-sm text-coffee-muted">
                {hasPaid ? t("paymentApproved") : t("waitingForPaymentApproval")}
              </p>
            </section>

            <section className="glass-card rounded-[24px] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                {t("price")}
              </p>
              <p className="mt-4 text-2xl font-semibold text-coffee-text">
                {formatCurrency(applicant.price)}
              </p>
              <p className="mt-2 text-sm text-coffee-muted">{t("courseFeeSet")}</p>
            </section>

            <section className="glass-card rounded-[24px] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                {t("interestStatus")}
              </p>
              <p className="mt-4 text-2xl font-semibold text-coffee-text">
                {applicant.interest_status === "interested"
                  ? t("interested")
                  : t("notInterested")}
              </p>
              <p className="mt-2 text-sm text-coffee-muted">{t("reminderLogic")}</p>
            </section>
          </div>

          {hasPaid ? (
            <section className="mt-6 glass-card rounded-[24px] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                {t("classReadiness")}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-coffee-border bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                    {t("schedule")}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-coffee-text">
                    {hasSchedule
                      ? formatScheduleSummary(applicant.assigned_schedule)
                      : t("waitingForScheduleAssignment")}
                  </p>
                </div>

                <div className="rounded-xl border border-coffee-border bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                    {t("startDate")}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-coffee-text">
                    {hasSchedule
                      ? formatDate(applicant.assigned_schedule.start_date)
                      : t("waitingForStartDate")}
                  </p>
                </div>

                <div className="rounded-xl border border-coffee-border bg-white/5 p-5 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                    {t("instructor")}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-coffee-text">
                    {applicant.assigned_schedule?.instructor || t("pendingShort")}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </AppBackdrop>
  );
}

export default StudentPortalPage;
