import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import {
  approvePayment, assignApplicantSchedule, declineApprovedPayment,
  getApplicantActivity, getApplicantById, getReceipt, getSchedules,
  rejectPayment, requestFullPayment, sendPaymentRequest,
  setApplicantInterest, updateApplicant
} from "../utils/api";
import { formatCurrency, formatDate, formatDateTime, paymentStatusColor, scheduleLabel } from "../utils/formatters";

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-[var(--admin-muted)] text-xs uppercase tracking-[0.2em]">{label}</p>
      <div className="mt-1 text-sm text-[var(--admin-text)]">{children}</div>
    </div>
  );
}

function Toast({ message, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 5000); return () => clearTimeout(t); }, [message, onDismiss]);
  if (!message) return null;
  return (
    <div className="rounded-[24px] border border-[var(--admin-accent)]/40 bg-[var(--admin-accent)]/10 px-4 py-3 text-sm text-[var(--admin-text)] flex items-center justify-between gap-4">
      <span>{message}</span>
      <button onClick={onDismiss} className="text-[var(--admin-muted)] hover:text-[var(--admin-text)]">✕</button>
    </div>
  );
}

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[var(--admin-text)]">Payment Receipt</h3>
          <button onClick={onClose} className="text-[var(--admin-muted)] hover:text-[var(--admin-text)]">✕</button>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          {[
            ["Student", receipt.student_name],
            ["Confirmation ID", receipt.confirmation_id || receipt._id],
            ["Program", receipt.program],
            ["Approved At", formatDateTime(receipt.approved_at)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-[var(--admin-muted)]">{label}</span>
              <span className="text-[var(--admin-text)] font-semibold text-right max-w-[60%] font-mono text-xs">{value}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-[var(--admin-muted)]">Amount</span>
            <span className="text-[var(--admin-success)] font-semibold">{formatCurrency(receipt.amount)}</span>
          </div>
        </div>
        <button onClick={() => window.print()} className="mt-6 w-full rounded-2xl bg-[var(--admin-accent)] px-4 py-3 text-sm font-semibold text-[var(--admin-bg)]">Print / Save</button>
      </div>
    </div>
  );
}

function ActivityLog({ activity = [] }) {
  if (!activity.length) return <p className="text-sm text-[var(--admin-muted)]">No activity recorded yet.</p>;
  return (
    <ol className="mt-4 space-y-3">
      {activity.map((entry, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--admin-accent)]/60" />
          <div>
            <p className="text-[var(--admin-text)]">{entry.description || entry.action}</p>
            <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
              {formatDateTime(entry.createdAt || entry.created_at)} · {entry.actor_name || "System"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
      <h3 className="text-xl font-semibold text-[var(--admin-text)]">{title}</h3>
      {children}
    </section>
  );
}

function Btn({ onClick, disabled, className, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

function ApplicantDetails() {
  const { applicantId } = useParams();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [applicant, setApplicant] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [activity, setActivity] = useState([]);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Confirm dialog state
  const [dialog, setDialog] = useState({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [declineReimbursed, setDeclineReimbursed] = useState(false);
  const [fullPaymentNote, setFullPaymentNote] = useState("");

  const load = async () => {
    const [a, s, act] = await Promise.all([
      getApplicantById(applicantId),
      getSchedules(),
      getApplicantActivity(applicantId).catch(() => [])
    ]);
    setApplicant(a); setSchedules(s); setActivity(act || []);
    setPrice(a.price || "");
  };

  useEffect(() => { load(); }, [applicantId]);

  if (!applicant) {
    return (
      <AdminShell title="Applicant Details" subtitle="Loading…">
        <Panel title="Loading applicant record…"><div className="mt-4 h-4 w-32 animate-pulse rounded bg-[var(--admin-soft)]" /></Panel>
      </AdminShell>
    );
  }

  const paymentApproved = applicant.payment_status === "paid";
  const paymentRequestDisabled = applicant.interest_status !== "interested" || Number(applicant.price || 0) <= 0;

  const act = async (fn, successMsg) => {
    try {
      setSubmitting(true);
      await fn();
      setMessage(successMsg);
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = (config) => setDialog({ open: true, ...config });
  const closeDialog = () => { setDialog({ open: false }); setRejectReason(""); setDeclineReason(""); setDeclineReimbursed(false); setFullPaymentNote(""); };

  return (
    <AdminShell
      title={`${applicant.personal_info.first_name} ${applicant.personal_info.last_name}`}
      subtitle="Manage interest, pricing, payment, and schedule assignment."
      actions={<Link to="/applicants" className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)]">← Back</Link>}
    >
      <Toast message={message} onDismiss={() => setMessage("")} />
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}

      {/* Price confirm dialog */}
      <ConfirmDialog
        open={dialog.open && dialog.type === "price"}
        title="Confirm Price"
        message={`You are setting the price to ${formatCurrency(dialog.value)}. Please double-check before saving.`}
        confirmLabel="Yes, Save Price"
        onConfirm={() => { closeDialog(); act(() => updateApplicant(applicantId, { price: Number(dialog.value) }), "Price saved."); }}
        onCancel={closeDialog}
      />

      {/* Approve payment dialog */}
      <ConfirmDialog
        open={dialog.open && dialog.type === "approve"}
        title="Approve Payment"
        message={`Approve payment of ${formatCurrency(applicant.price)} for ${applicant.personal_info.first_name}? The student will be notified via Telegram.`}
        confirmLabel="Yes, Approve"
        onConfirm={() => { closeDialog(); act(() => approvePayment(applicantId), "Payment approved."); }}
        onCancel={closeDialog}
      />

      {/* Reject payment dialog */}
      <ConfirmDialog
        open={dialog.open && dialog.type === "reject"}
        title="Reject Payment"
        message="Provide a reason — this will be sent to the student via Telegram."
        confirmLabel="Confirm Reject"
        danger
        onConfirm={() => { if (!rejectReason.trim()) return; closeDialog(); act(() => rejectPayment(applicantId, rejectReason), "Payment rejected."); }}
        onCancel={closeDialog}
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection…"
          className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none min-h-[80px]"
        />
      </ConfirmDialog>

      {/* Decline approved payment dialog (super admin only) */}
      <ConfirmDialog
        open={dialog.open && dialog.type === "decline_approved"}
        title="Decline Approved Payment"
        message="This payment was already approved. Provide a reason and indicate if the student has been reimbursed."
        confirmLabel="Decline Payment"
        danger
        onConfirm={() => { if (!declineReason.trim()) return; closeDialog(); act(() => declineApprovedPayment(applicantId, declineReason, declineReimbursed), "Approved payment declined."); }}
        onCancel={closeDialog}
      >
        <div className="space-y-3">
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Reason for declining…"
            className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none min-h-[80px]"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--admin-text)] cursor-pointer">
            <input type="checkbox" checked={declineReimbursed} onChange={(e) => setDeclineReimbursed(e.target.checked)}
              className="h-4 w-4 rounded" />
            Student has been reimbursed
          </label>
        </div>
      </ConfirmDialog>

      {/* Full payment dialog */}
      <ConfirmDialog
        open={dialog.open && dialog.type === "full_payment"}
        title="Request Full Payment"
        message="Send a full payment request to the student via Telegram. Add an optional note below."
        confirmLabel="Send Request"
        onConfirm={() => { closeDialog(); act(() => requestFullPayment(applicantId, fullPaymentNote), "Full payment request sent."); }}
        onCancel={closeDialog}
      >
        <textarea
          value={fullPaymentNote}
          onChange={(e) => setFullPaymentNote(e.target.value)}
          placeholder="Optional note to student…"
          className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none min-h-[80px]"
        />
      </ConfirmDialog>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        {/* Left */}
        <div className="space-y-6">
          <Panel title="Applicant Snapshot">
            <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
              <InfoRow label="Email">{applicant.personal_info.email}</InfoRow>
              <InfoRow label="Phone">{applicant.personal_info.phone}</InfoRow>
              <InfoRow label="Telegram">
                {applicant.username ? `@${applicant.username}` : "—"}
              </InfoRow>
              <InfoRow label="Program">{applicant.course_details?.program_type || "—"}</InfoRow>
              <InfoRow label="Interest">
                <span className={`font-semibold capitalize ${applicant.interest_status === "interested" ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]"}`}>
                  {applicant.interest_status?.replace("_", " ")}
                </span>
              </InfoRow>
              <InfoRow label="Payment">
                <span className={`font-semibold capitalize ${paymentStatusColor(applicant.payment_status)}`}>
                  {applicant.payment_status}
                </span>
              </InfoRow>
              <InfoRow label="Schedule">{scheduleLabel(applicant.assigned_schedule)}</InfoRow>
              <InfoRow label="Start Date">{formatDate(applicant.assigned_schedule?.start_date)}</InfoRow>
              <InfoRow label="Price">{formatCurrency(applicant.price)}</InfoRow>
              <InfoRow label="Reminders">
                {applicant.reminder_enabled
                  ? <span className="text-[var(--admin-success)]">Enabled</span>
                  : <span className="text-[var(--admin-muted)]">Disabled</span>}
              </InfoRow>
            </div>

            {applicant.payment_screenshot_url && (
              <div className="mt-6 flex gap-3 flex-wrap">
                <a href={applicant.payment_screenshot_url} target="_blank" rel="noreferrer"
                  className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)]">
                  View Payment Screenshot ↗
                </a>
                {paymentApproved && (
                  <button onClick={async () => { try { const r = await getReceipt(applicantId); setReceipt(r); } catch { setMessage("Receipt not available."); } }}
                    className="rounded-2xl bg-[var(--admin-success)] px-4 py-3 text-sm font-semibold text-[var(--admin-bg)]">
                    View Receipt
                  </button>
                )}
              </div>
            )}
          </Panel>

          <Panel title="Activity History">
            <ActivityLog activity={activity} />
          </Panel>
        </div>

        {/* Right: actions */}
        <div className="space-y-6">
          {/* Interest */}
          <Panel title="Interest">
            <div className="mt-5 flex gap-3">
              <Btn disabled={submitting || applicant.interest_status === "interested"}
                onClick={() => act(() => setApplicantInterest(applicantId, "interested"), "Marked as interested.")}
                className="flex-1 bg-[var(--admin-accent)] text-[var(--admin-bg)]">
                Mark Interested
              </Btn>
              <Btn disabled={submitting || applicant.interest_status === "not_interested"}
                onClick={() => act(() => setApplicantInterest(applicantId, "not_interested"), "Marked as not interested.")}
                className="flex-1 border border-[var(--admin-border)] bg-[var(--admin-soft)] text-[var(--admin-text)]">
                Not Interested
              </Btn>
            </div>
          </Panel>

          {/* Pricing */}
          {!paymentApproved && (
            <Panel title="Pricing">
              <div className="mt-5 flex gap-3">
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Set price (ETB)"
                  type="number" min="0"
                  className="flex-1 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none" />
                <Btn disabled={submitting}
                  onClick={() => openDialog({ type: "price", value: price })}
                  className="bg-[var(--admin-accent)] text-[var(--admin-bg)]">
                  Save
                </Btn>
              </div>
              <p className="mt-2 text-xs text-[var(--admin-muted)]">A confirmation dialog will appear before saving.</p>
            </Panel>
          )}

          {/* Payment Actions */}
          <Panel title="Payment Actions">
            <div className="mt-5 space-y-3">
              {!paymentApproved && (
                <Btn disabled={submitting || paymentRequestDisabled}
                  onClick={() => act(() => sendPaymentRequest(applicantId), "Payment request sent via Telegram.")}
                  className="w-full bg-[var(--admin-accent)] text-[var(--admin-bg)]">
                  Send Payment Request
                </Btn>
              )}

              {!paymentApproved && applicant.payment_screenshot_url && (
                <Btn disabled={submitting}
                  onClick={() => openDialog({ type: "approve" })}
                  className="w-full bg-[var(--admin-success)] text-[var(--admin-bg)]">
                  Approve Payment
                </Btn>
              )}

              {!paymentApproved && applicant.payment_screenshot_url && (
                <Btn disabled={submitting}
                  onClick={() => openDialog({ type: "reject" })}
                  className="w-full border border-[var(--admin-danger)]/40 bg-[var(--admin-danger)]/10 text-[var(--admin-text)]">
                  Reject Payment
                </Btn>
              )}

              {/* Super Admin: decline an already-approved payment */}
              {paymentApproved && isSuperAdmin && (
                <Btn disabled={submitting}
                  onClick={() => openDialog({ type: "decline_approved" })}
                  className="w-full border border-[var(--admin-danger)]/40 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]">
                  ⚠ Decline Approved Payment
                </Btn>
              )}

              {!paymentApproved && (
                <Btn disabled={submitting || paymentRequestDisabled}
                  onClick={() => openDialog({ type: "full_payment" })}
                  className="w-full border border-[var(--admin-border)] bg-[var(--admin-soft)] text-[var(--admin-text)]">
                  Request Full Payment
                </Btn>
              )}

              <Btn disabled={submitting}
                onClick={() => act(() => updateApplicant(applicantId, { reminder_enabled: !applicant.reminder_enabled }), applicant.reminder_enabled ? "Reminders off." : "Reminders on.")}
                className="w-full border border-[var(--admin-border)] bg-[var(--admin-soft)] text-[var(--admin-text)]">
                {applicant.reminder_enabled ? "Disable Reminders" : "Enable Reminders"}
              </Btn>
            </div>
          </Panel>

          {/* Schedule */}
          <Panel title="Assign Schedule">
            <div className="mt-5 space-y-4">
              <select value={applicant.assigned_schedule?._id || ""} disabled={submitting}
                onChange={(e) => { if (!e.target.value) return; act(() => assignApplicantSchedule(applicantId, e.target.value), "Schedule assigned."); }}
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none disabled:opacity-50">
                <option value="">Select a schedule</option>
                {schedules.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} · {s.type} · {s.time}</option>
                ))}
              </select>
              <p className="text-xs leading-6 text-[var(--admin-muted)]">
                Only paid applicants receive automatic Telegram notifications when assigned.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

export default ApplicantDetails;
