import { useEffect } from "react";

/**
 * Custom confirm dialog — replaces browser alert/confirm.
 * Props:
 *   open        - boolean
 *   title       - string
 *   message     - string (supports JSX)
 *   confirmLabel- string (default "Confirm")
 *   cancelLabel - string (default "Cancel")
 *   danger      - boolean — red confirm button
 *   onConfirm   - fn
 *   onCancel    - fn
 *   children    - optional extra content (e.g. textarea for reason)
 */
function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, onConfirm, onCancel, children }) {
  useEffect(() => {
    if (open) {
      const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Please confirm</p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">{title}</h3>
        {message && (
          <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">{message}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              danger
                ? "bg-[var(--admin-danger)] text-white hover:opacity-90"
                : "bg-[var(--admin-accent)] text-[var(--admin-bg)] hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-border)] transition"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
