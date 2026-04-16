import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import {
  approvePayment,
  assignApplicantSchedule,
  getApplicantById,
  getSchedules,
  sendPaymentRequest,
  setApplicantInterest,
  updateApplicant
} from "../utils/api";
import {
  formatCurrency,
  formatDate,
  scheduleLabel
} from "../utils/formatters";

function ApplicantDetails() {
  const { applicantId } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [nextApplicant, nextSchedules] = await Promise.all([
      getApplicantById(applicantId),
      getSchedules()
    ]);
    setApplicant(nextApplicant);
    setSchedules(nextSchedules);
    setPrice(nextApplicant.price || "");
  };

  useEffect(() => {
    load();
  }, [applicantId]);

  if (!applicant) {
    return (
      <AdminShell title="Applicant Details" subtitle="Loading applicant record.">
        <div className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
          Loading...
        </div>
      </AdminShell>
    );
  }

  const paymentRequestDisabled =
    applicant.interest_status !== "interested" || Number(applicant.price || 0) <= 0;

  return (
    <AdminShell
      title={`${applicant.personal_info.first_name} ${applicant.personal_info.last_name}`}
      subtitle="Manage interest, pricing, reminders, payment approval, and schedule assignment from one place."
      actions={
        <Link
          to="/applicants"
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-2 text-sm font-semibold text-admin-text"
        >
          Back to Applicants
        </Link>
      }
    >
      {message ? (
        <div className="rounded-[24px] border border-admin-accent/40 bg-admin-accent/10 px-4 py-3 text-sm text-admin-text">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
          <h3 className="text-xl font-semibold text-admin-text">Applicant Snapshot</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="text-admin-muted">Email</p>
              <p className="mt-1 text-admin-text">{applicant.personal_info.email}</p>
            </div>
            <div>
              <p className="text-admin-muted">Phone</p>
              <p className="mt-1 text-admin-text">{applicant.personal_info.phone}</p>
            </div>
            <div>
              <p className="text-admin-muted">Program</p>
              <p className="mt-1 text-admin-text">{applicant.course_details.program_type}</p>
            </div>
            <div>
              <p className="text-admin-muted">Interest Status</p>
              <p className="mt-1 text-admin-text">{applicant.interest_status}</p>
            </div>
            <div>
              <p className="text-admin-muted">Payment Status</p>
              <p className="mt-1 text-admin-text">{applicant.payment_status}</p>
            </div>
            <div>
              <p className="text-admin-muted">Assigned Schedule</p>
              <p className="mt-1 text-admin-text">
                {scheduleLabel(applicant.assigned_schedule)}
              </p>
            </div>
            <div>
              <p className="text-admin-muted">Start Date</p>
              <p className="mt-1 text-admin-text">
                {formatDate(applicant.assigned_schedule?.start_date)}
              </p>
            </div>
            <div>
              <p className="text-admin-muted">Reminder Enabled</p>
              <p className="mt-1 text-admin-text">
                {applicant.reminder_enabled ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {applicant.payment_screenshot_url ? (
            <a
              href={applicant.payment_screenshot_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text"
            >
              View Payment Screenshot
            </a>
          ) : null}
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">Actions</h3>
            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await setApplicantInterest(applicantId, "interested");
                    setMessage("Applicant marked as interested.");
                    await load();
                  }}
                  className="rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg"
                >
                  Mark Interested
                </button>
                <button
                  onClick={async () => {
                    await setApplicantInterest(applicantId, "not_interested");
                    setMessage("Applicant marked as not interested. Payment requests and reminders are blocked.");
                    await load();
                  }}
                  className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text"
                >
                  Mark Not Interested
                </button>
              </div>

              <div className="flex gap-3">
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Set price"
                  className="flex-1 rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
                />
                <button
                  onClick={async () => {
                    await updateApplicant(applicantId, { price: Number(price) || 0 });
                    setMessage("Price updated.");
                    await load();
                  }}
                  className="rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg"
                >
                  Save Price
                </button>
              </div>

              <button
                onClick={async () => {
                  await sendPaymentRequest(applicantId);
                  setMessage("Payment request sent through Telegram.");
                }}
                disabled={paymentRequestDisabled}
                className="w-full rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg disabled:opacity-50"
              >
                Send Payment Request
              </button>

              <button
                onClick={async () => {
                  await approvePayment(applicantId);
                  setMessage("Payment approved. Class details will be sent automatically when a schedule is assigned.");
                  await load();
                }}
                className="w-full rounded-2xl bg-admin-success px-4 py-3 text-sm font-semibold text-admin-bg"
              >
                Approve Payment
              </button>

              <button
                onClick={async () => {
                  await updateApplicant(applicantId, {
                    reminder_enabled: !applicant.reminder_enabled
                  });
                  setMessage(
                    applicant.reminder_enabled
                      ? "Reminders turned off."
                      : "Reminders turned on."
                  );
                  await load();
                }}
                className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text"
              >
                {applicant.reminder_enabled ? "Disable Reminders" : "Enable Reminders"}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">Assign Schedule</h3>
            <div className="mt-5 space-y-4">
              <select
                value={applicant.assigned_schedule?._id || ""}
                onChange={async (event) => {
                  if (!event.target.value) {
                    return;
                  }
                  await assignApplicantSchedule(applicantId, event.target.value);
                  setMessage("Schedule assigned. If payment is already approved, class details were sent automatically.");
                  await load();
                }}
                className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
              >
                <option value="">Select a schedule</option>
                {schedules.map((schedule) => (
                  <option key={schedule._id} value={schedule._id}>
                    {schedule.name} • {schedule.type} • {schedule.time}
                  </option>
                ))}
              </select>
              <p className="text-sm leading-7 text-admin-muted">
                If the applicant is marked as not interested, payment requests and reminders remain blocked even after a schedule is assigned.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

export default ApplicantDetails;
