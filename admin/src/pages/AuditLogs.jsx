import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { getAuditLogs } from "../utils/api";
import { formatDateTime } from "../utils/formatters";

const PAGE_SIZE = 30;

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await getAuditLogs({
        search: search || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        page,
        limit: PAGE_SIZE
      });
      setLogs(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        total: response.pagination?.total || response.data?.length || 0,
        pages: response.pagination?.pages || 1
      });
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter]);

  useEffect(() => {
    const t = setTimeout(() => load(1), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const actionColor = (action = "") => {
    if (action.includes("approve") || action.includes("create") || action.includes("activate")) return "text-[var(--admin-success)]";
    if (action.includes("reject") || action.includes("delete") || action.includes("disable")) return "text-[var(--admin-danger)]";
    if (action.includes("payment") || action.includes("update")) return "text-[var(--admin-warning)]";
    return "text-[var(--admin-muted)]";
  };

  return (
    <AdminShell
      title="Audit Logs"
      subtitle="Full audit trail of all system actions — authentication events, payment actions, and user management."
    >
      {/* Filters */}
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, or description"
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="payment">Payment</option>
            <option value="applicant">Applicant</option>
            <option value="user_management">User Management</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-[24px] border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-[var(--admin-text)]">
          {error}
        </div>
      )}

      {/* Logs table */}
      <section className="overflow-hidden rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--admin-soft)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Actor</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Target</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--admin-muted)]">Loading…</td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--admin-muted)]">No audit logs found.</td>
                </tr>
              )}
              {!loading && logs.map((log, i) => (
                <tr key={log._id || i} className="border-t border-[var(--admin-border)]">
                  <td className="px-5 py-4 whitespace-nowrap text-[var(--admin-muted)] text-xs">
                    {formatDateTime(log.created_at || log.timestamp)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--admin-text)]">{log.actor_name || log.actor}</p>
                    <p className="mt-0.5 text-xs text-[var(--admin-muted)] uppercase">{log.actor_role}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-xs font-semibold ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[var(--admin-text)] max-w-xs">
                    {log.description || log.message || "—"}
                  </td>
                  <td className="px-5 py-4 text-[var(--admin-muted)] text-xs">
                    {log.target_type && (
                      <span>{log.target_type}: {log.target_id}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-4">
            <p className="text-sm text-[var(--admin-muted)]">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => load(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => load(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

export default AuditLogs;
