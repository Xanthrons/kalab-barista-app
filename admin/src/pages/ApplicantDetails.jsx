import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import {
  approvePayment,
  assignApplicantSchedule,
  getApplicantById,
  getApplicantActivity,
  getReceipt,
  getSchedules,
  rejectPayment,
  requestFullPayment,
  sendPaymentRequest,
  setApplicantInterest,
  updateApplicant,
} from "../utils/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  paymentStatusColor,
  scheduleLabel,
} from "../utils/formatters";

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-admin-muted text-xs uppercase tracking-[0.2em]">
        {label}
      </p>
      <div className="mt-1 text-sm text-admin-text">{children}</div>
    </div>
  );
}

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);
  if (!message) return null;
  return (
    <div className="rounded-[24px] border border-admin-accent/40 bg-admin-accent/10 px-4 py-3 text-sm text-admin-text flex items-center justify-between gap-4">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="text-admin-muted hover:text-admin-text"
      >
        ✕
      </button>
    </div>
  );
}

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-admin-text">
            Payment Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-admin-muted hover:text-admin-text"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-admin-muted">Student</span>
            <span className="text-admin-text font-semibold">
              {receipt.student_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-muted">Confirmation ID</span>
            <span className="text-admin-text font-mono text-xs">
              {receipt.confirmation_id || receipt._id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-muted">Amount</span>
            <span className="text-admin-success font-semibold">
              {formatCurrency(receipt.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-muted">Program</span>
            <span className="text-admin-text">{receipt.program}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-muted">Approved At</span>
            <span className="text-admin-text">
              {formatDateTime(receipt.approved_at)}
            </span>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="mt-6 w-full rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg"
        >
          Print / Save
        </button>
      </div>
    </div>
  );
}

function ActivityLog({ activity = [] }) {
  if (!activity.length)
    return (
      <p className="text-sm text-admin-muted">No activity recorded yet.</p>
    );
  return (
    <ol className="mt-4 space-y-3">
      {activity.map((entry, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-admin-accent/60" />
          <div>
            <p className="text-admin-text">
              {entry.description || entry.action}
            </p>
            <p className="mt-0.5 text-xs text-admin-muted">
              {formatDateTime(entry.created_at || entry.timestamp)} ·{" "}
              {entry.actor_name || entry.actor || "System"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function ApplicantDetails() {
  const { applicantId } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [activity, setActivity] = useState([]);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showFullPaymentForm, setShowFullPaymentForm] = useState(false);
  const [fullPaymentNote, setFullPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // UPDATED LOGIC: Telegram Proxy States
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const load = async () => {
    const [nextApplicant, nextSchedules, nextActivity] = await Promise.all([
      getApplicantById(applicantId),
      getSchedules(),
      getApplicantActivity(applicantId).catch(() => []),
    ]);
    setApplicant(nextApplicant);
    setSchedules(nextSchedules);
    setActivity(nextActivity || []);
    setPrice(nextApplicant.price || "");
  };

  useEffect(() => {
    load();
  }, [applicantId]);

  // UPDATED LOGIC: Function to fetch from Telegram via your Proxy
  const handleReviewScreenshot = async () => {
    if (screenshotUrl) {
      setScreenshotUrl(null); // Toggle off if already shown
      return;
    }

    const fileId =
      applicant.payment_screenshot_file_id || applicant.payment_screenshot_url;

    if (!fileId) {
      setMessage("No screenshot data available.");
      return;
    }

    try {
      setLoadingImage(true);
      // Constructing the link to your proxy route (e.g., /api/proxy-image?fileId=...)
      const proxyUrl = `${process.env.REACT_APP_API_URL}/proxy-image?fileId=${fileId}`;
      setScreenshotUrl(proxyUrl);
    } catch (err) {
      setMessage("Could not retrieve image from Telegram.");
    } finally {
      setLoadingImage(false);
    }
  };

  if (!applicant) {
    return (
      <AdminShell
        title="Applicant Details"
        subtitle="Loading applicant record."
      >
        <div className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
          Loading…
        </div>
      </AdminShell>
    );
  }

  const paymentRequestDisabled =
    applicant.interest_status !== "interested" ||
    Number(applicant.price || 0) <= 0;

  const paymentApproved = applicant.payment_status === "paid";

  const act = async (fn, successMsg) => {
    try {
      setSubmitting(true);
      await fn();
      setMessage(successMsg);
      await load();
    } catch (err) {
      setMessage(
        err?.response?.data?.message || "Action failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell
      title={`${applicant.personal_info.first_name} ${applicant.personal_info.last_name}`}
      subtitle="Manage interest, pricing, payment approval, receipt, and schedule assignment."
      actions={
        <Link
          to="/applicants"
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-2 text-sm font-semibold text-admin-text"
        >
          ← Back
        </Link>
      }
    >
      <Toast message={message} onDismiss={() => setMessage("")} />
      {receipt && (
        <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        {/* Left: info + activity */}
        <div className="space-y-6">
          <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">
              Applicant Snapshot
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
              <InfoRow label="Email">{applicant.personal_info.email}</InfoRow>
              <InfoRow label="Phone">{applicant.personal_info.phone}</InfoRow>
              <InfoRow label="Telegram">
                {applicant.personal_info.telegram_username
                  ? `@${applicant.personal_info.telegram_username}`
                  : "—"}
              </InfoRow>
              <InfoRow label="Program">
                {applicant.course_details?.program_type || "—"}
              </InfoRow>
              <InfoRow label="Interest">
                <span
                  className={`font-semibold capitalize ${
                    applicant.interest_status === "interested"
                      ? "text-admin-success"
                      : "text-admin-danger"
                  }`}
                >
                  {applicant.interest_status?.replace("_", " ")}
                </span>
              </InfoRow>
              <InfoRow label="Payment">
                <span
                  className={`font-semibold capitalize ${paymentStatusColor(applicant.payment_status)}`}
                >
                  {applicant.payment_status}
                </span>
              </InfoRow>
              <InfoRow label="Assigned Schedule">
                {scheduleLabel(applicant.assigned_schedule)}
              </InfoRow>
              <InfoRow label="Start Date">
                {formatDate(applicant.assigned_schedule?.start_date)}
              </InfoRow>
              <InfoRow label="Price">{formatCurrency(applicant.price)}</InfoRow>
              <InfoRow label="Reminders">
                {applicant.reminder_enabled ? (
                  <span className="text-admin-success">Enabled</span>
                ) : (
                  <span className="text-admin-muted">Disabled</span>
                )}
              </InfoRow>
            </div>

            {/* UPDATED LOGIC: Telegram Screenshot Display */}
            {(applicant.payment_screenshot_file_id ||
              applicant.payment_screenshot_url) && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleReviewScreenshot}
                    disabled={loadingImage}
                    className="inline-flex rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text transition-all hover:bg-admin-border"
                  >
                    {loadingImage
                      ? "Fetching..."
                      : screenshotUrl
                        ? "Hide Screenshot"
                        : "Review Payment Screenshot"}
                  </button>

                  {paymentApproved && (
                    <button
                      onClick={async () => {
                        try {
                          const r = await getReceipt(applicantId);
                          setReceipt(r);
                        } catch {
                          setMessage("Receipt not available yet.");
                        }
                      }}
                      className="rounded-2xl bg-admin-success px-4 py-3 text-sm font-semibold text-admin-bg"
                    >
                      View Receipt
                    </button>
                  )}
                </div>

                {/* Glassmorphism Preview Container */}
                {screenshotUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-admin-border bg-admin-soft/30 backdrop-blur-md p-2 shadow-inner">
                    <img
                      src={screenshotUrl}
                      alt="Payment proof from Telegram"
                      className="max-h-[500px] w-full rounded-xl object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Activity Log */}
          <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">
              Activity History
            </h3>
            <ActivityLog activity={activity} />
          </section>
        </div>

        {/* Right: actions */}
        <div className="space-y-6">
          {/* Interest */}
          <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">Interest</h3>
            <div className="mt-5 flex gap-3">
              <button
                disabled={
                  submitting || applicant.interest_status === "interested"
                }
                onClick={() =>
                  act(
                    () => setApplicantInterest(applicantId, "interested"),
                    "Marked as interested.",
                  )
                }
                className="flex-1 rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg disabled:opacity-50"
              >
                Mark Interested
              </button>
              <button
                disabled={
                  submitting || applicant.interest_status === "not_interested"
                }
                onClick={() =>
                  act(
                    () => setApplicantInterest(applicantId, "not_interested"),
                    "Marked as not interested. Payment requests and reminders are blocked.",
                  )
                }
                className="flex-1 rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text disabled:opacity-50"
              >
                Not Interested
              </button>
            </div>
          </section>

          {/* Pricing */}
          {!paymentApproved && (
            <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
              <h3 className="text-xl font-semibold text-admin-text">Pricing</h3>
              <div className="mt-5 flex gap-3">
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Set price (ETB)"
                  type="number"
                  min="0"
                  className="flex-1 rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
                />
                <button
                  disabled={submitting}
                  onClick={() =>
                    act(
                      () =>
                        updateApplicant(applicantId, {
                          price: Number(price) || 0,
                        }),
                      "Price updated.",
                    )
                  }
                  className="rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </section>
          )}

          {/* Payment Actions */}
          <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">
              Payment Actions
            </h3>
            <div className="mt-5 space-y-3">
              {/* Send payment request */}
              {!paymentApproved && (
                <button
                  disabled={submitting || paymentRequestDisabled}
                  onClick={() =>
                    act(
                      () => sendPaymentRequest(applicantId),
                      "Payment request sent via Telegram.",
                    )
                  }
                  className="w-full rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg disabled:opacity-50"
                >
                  Send Payment Request
                </button>
              )}

              {/* Approve */}
              {!paymentApproved &&
                (applicant.payment_screenshot_file_id ||
                  applicant.payment_screenshot_url) && (
                  <button
                    disabled={submitting}
                    onClick={() =>
                      act(
                        () => approvePayment(applicantId),
                        "Payment approved. Class details will be sent automatically when a schedule is assigned.",
                      )
                    }
                    className="w-full rounded-2xl bg-admin-success px-4 py-3 text-sm font-semibold text-admin-bg disabled:opacity-50"
                  >
                    Approve Payment
                  </button>
                )}

              {/* Reject */}
              {!paymentApproved &&
                (applicant.payment_screenshot_file_id ||
                  applicant.payment_screenshot_url) && (
                  <>
                    {!showRejectForm ? (
                      <button
                        disabled={submitting}
                        onClick={() => setShowRejectForm(true)}
                        className="w-full rounded-2xl border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm font-semibold text-admin-text"
                      >
                        Reject Payment
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection (sent to student via Telegram)"
                          className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none min-h-[80px]"
                        />
                        <div className="flex gap-3">
                          <button
                            disabled={submitting}
                            onClick={() =>
                              act(
                                () => rejectPayment(applicantId, rejectReason),
                                "Payment rejected. Student notified via Telegram.",
                              ).then(() => {
                                setShowRejectForm(false);
                                setRejectReason("");
                              })
                            }
                            className="flex-1 rounded-2xl bg-admin-danger/80 px-4 py-3 text-sm font-semibold text-white"
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => setShowRejectForm(false)}
                            className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

              {/* Request full payment */}
              {!paymentApproved && (
                <>
                  {!showFullPaymentForm ? (
                    <button
                      disabled={submitting || paymentRequestDisabled}
                      onClick={() => setShowFullPaymentForm(true)}
                      className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text disabled:opacity-50"
                    >
                      Request Full Payment
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={fullPaymentNote}
                        onChange={(e) => setFullPaymentNote(e.target.value)}
                        placeholder="Optional note to student about remaining balance"
                        className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none min-h-[80px]"
                      />
                      <div className="flex gap-3">
                        <button
                          disabled={submitting}
                          onClick={() =>
                            act(
                              () =>
                                requestFullPayment(
                                  applicantId,
                                  fullPaymentNote,
                                ),
                              "Full payment request sent via Telegram.",
                            ).then(() => {
                              setShowFullPaymentForm(false);
                              setFullPaymentNote("");
                            })
                          }
                          className="flex-1 rounded-2xl bg-admin-accent px-4 py-3 text-sm font-semibold text-admin-bg"
                        >
                          Send Request
                        </button>
                        <button
                          onClick={() => setShowFullPaymentForm(false)}
                          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reminders toggle */}
              <button
                disabled={submitting}
                onClick={() =>
                  act(
                    () =>
                      updateApplicant(applicantId, {
                        reminder_enabled: !applicant.reminder_enabled,
                      }),
                    applicant.reminder_enabled
                      ? "Reminders turned off."
                      : "Reminders turned on.",
                  )
                }
                className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm font-semibold text-admin-text disabled:opacity-50"
              >
                {applicant.reminder_enabled
                  ? "Disable Reminders"
                  : "Enable Reminders"}
              </button>
            </div>
          </section>

          {/* Schedule Assignment */}
          <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-admin-text">
              Assign Schedule
            </h3>
            <div className="mt-5 space-y-4">
              <select
                value={applicant.assigned_schedule?._id || ""}
                onChange={async (e) => {
                  if (!e.target.value) return;
                  await act(
                    () => assignApplicantSchedule(applicantId, e.target.value),
                    "Schedule assigned. If payment is already approved, class details were sent automatically.",
                  );
                }}
                disabled={submitting}
                className="w-full rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none disabled:opacity-50"
              >
                <option value="">Select a schedule</option>
                {schedules.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} · {s.type} · {s.time}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-6 text-admin-muted">
                Only paid applicants receive automatic Telegram notifications
                when assigned. If marked not interested, payment requests and
                reminders remain blocked.
              </p>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

export default ApplicantDetails;
