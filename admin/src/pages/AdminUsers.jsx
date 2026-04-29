import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { createAdminUser, deleteAdminUser, getAdminUsers, resetAdminPassword, updateAdminUser } from "../utils/api";
import { formatDateTime } from "../utils/formatters";

const emptyForm = { name: "", email: "", password: "", role: "admin" };

function StatusBadge({ active }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
      active ? "bg-[var(--admin-success)]/20 text-[var(--admin-success)]" : "bg-[var(--admin-danger)]/20 text-[var(--admin-danger)]"
    }`}>
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false });
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const load = async () => {
    try { setAdmins(await getAdminUsers()); }
    catch { setError("Failed to load admin users."); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setError("Name, email, and password are required."); return; }
    try {
      setSubmitting(true); setError("");
      await createAdminUser(form);
      setForm(emptyForm);
      setSuccess("Admin user created successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create admin user.");
    } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (admin) => {
    const id = admin._id || admin.id;
    if (id === (currentUser._id || currentUser.id) && admin.is_active) {
      setError("You cannot deactivate your own account.");
      return;
    }
    try {
      await updateAdminUser(id, { is_active: !admin.is_active });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user status.");
    }
  };

  const handleDelete = async (id) => {
    try { await deleteAdminUser(id); setDialog({ open: false }); await load(); }
    catch (err) { setError(err?.response?.data?.message || "Failed to delete admin user."); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setResetError("Password must be at least 6 characters."); return; }
    try {
      setSubmitting(true); setResetError("");
      await resetAdminPassword(resetTarget._id || resetTarget.id, newPassword);
      setResetTarget(null); setNewPassword("");
      setSuccess(`Password reset for ${resetTarget.name}.`);
    } catch (err) {
      setResetError(err?.response?.data?.message || "Failed to reset password.");
    } finally { setSubmitting(false); }
  };

  const field = (key, placeholder, type = "text") => (
    <input type={type} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      placeholder={placeholder}
      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none" />
  );

  return (
    <AdminShell title="Admin Users" subtitle="Create, manage, and reset passwords for dashboard users. Super Admin access only.">

      {/* Reset password dialog */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-[var(--admin-text)]">Reset Password</h3>
            <p className="mt-2 text-sm text-[var(--admin-muted)]">Set a new password for <strong>{resetTarget.name}</strong>.</p>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              className="mt-4 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none" />
            {resetError && <p className="mt-2 text-xs text-[var(--admin-danger)]">{resetError}</p>}
            <div className="mt-4 flex gap-3">
              <button disabled={submitting} onClick={handleResetPassword}
                className="flex-1 rounded-2xl bg-[var(--admin-accent)] px-4 py-3 text-sm font-semibold text-[var(--admin-bg)] disabled:opacity-60">
                {submitting ? "Resetting…" : "Reset Password"}
              </button>
              <button onClick={() => { setResetTarget(null); setNewPassword(""); setResetError(""); }}
                className="flex-1 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={dialog.open && dialog.type === "delete"}
        title="Delete Admin"
        message={`Delete "${dialog.admin?.name}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        danger
        onConfirm={() => handleDelete(dialog.admin?._id || dialog.admin?.id)}
        onCancel={() => setDialog({ open: false })}
      />

      {/* Create form */}
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <h3 className="text-xl font-semibold text-[var(--admin-text)]">Create Admin</h3>
        {error && <div className="mt-4 rounded-2xl border border-[var(--admin-danger)]/40 bg-[var(--admin-danger)]/10 px-4 py-3 text-sm text-[var(--admin-text)]">{error}</div>}
        {success && <div className="mt-4 rounded-2xl border border-[var(--admin-success)]/40 bg-[var(--admin-success)]/10 px-4 py-3 text-sm text-[var(--admin-text)]">{success}</div>}
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {field("name", "Full Name")}
          {field("email", "Email")}
          {field("password", "Password", "password")}
          <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none">
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button type="button" disabled={submitting} onClick={handleCreate}
          className="mt-4 rounded-2xl bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-[var(--admin-bg)] disabled:opacity-60">
          {submitting ? "Creating…" : "Create Admin"}
        </button>
      </section>

      {/* Team list */}
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <h3 className="text-xl font-semibold text-[var(--admin-text)]">Team ({admins.length})</h3>
        <div className="mt-5 space-y-3">
          {admins.length === 0 && <p className="text-sm text-[var(--admin-muted)]">No admin users found.</p>}
          {admins.map((admin) => {
            const id = admin._id || admin.id;
            const isSelf = id === (currentUser._id || currentUser.id);
            return (
              <div key={id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-accent)]/20 text-sm font-bold text-[var(--admin-accent)]">
                    {admin.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--admin-text)]">{admin.name} {isSelf && <span className="text-xs text-[var(--admin-accent)]">(You)</span>}</p>
                    <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{admin.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs uppercase text-[var(--admin-muted)]">{admin.role?.replace("_", " ")}</span>
                      <StatusBadge active={admin.is_active} />
                    </div>
                    {admin.last_login_at && (
                      <p className="mt-1 text-xs text-[var(--admin-muted)]">Last login: {formatDateTime(admin.last_login_at)}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Reset password */}
                  <button onClick={() => { setResetTarget(admin); setNewPassword(""); setResetError(""); }}
                    className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-border)] transition">
                    Reset Password
                  </button>
                  {/* Toggle active — cannot deactivate self */}
                  {!isSelf && (
                    <button onClick={() => handleToggleStatus(admin)}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-border)] transition">
                      {admin.is_active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                  {/* Delete — cannot delete self */}
                  {!isSelf && (
                    <button onClick={() => setDialog({ open: true, type: "delete", admin })}
                      className="rounded-2xl border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-semibold text-[var(--admin-danger)]">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}

export default AdminUsers;
