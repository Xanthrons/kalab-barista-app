import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { getApplicants } from "../utils/api";
import { formatCurrency, paymentStatusColor, interestStatusColor } from "../utils/formatters";

const PAGE_SIZE = 20;

function StatusBadge({ value, colorFn }) {
  return (
    <span className={`font-semibold capitalize ${colorFn(value)}`}>
      {value?.replace("_", " ") || "—"}
    </span>
  );
}

function Applicants() {
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [interestStatus, setInterestStatus] = useState("all");
  const [enrollmentStatus, setEnrollmentStatus] = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await getApplicants({
        search: search || undefined,
        payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
        interest_status: interestStatus !== "all" ? interestStatus : undefined,
        enrollment_status: enrollmentStatus !== "all" ? enrollmentStatus : undefined,
        page,
        limit: PAGE_SIZE
      });
      setApplicants(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        total: response.pagination?.total || response.data?.length || 0,
        pages: response.pagination?.pages || 1
      });
    } catch {
      setError("Failed to load applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, paymentStatus, interestStatus, enrollmentStatus]);

  useEffect(() => {
    const timer = setTimeout(() => load(1), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <AdminShell
      title="Applicants"
      subtitle="Search and filter applicants, then drill into payment, interest, and schedule assignment details."
    >
      {/* Filters */}
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or username"
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          />
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={interestStatus}
            onChange={(e) => setInterestStatus(e.target.value)}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          >
            <option value="all">All Interest</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
          </select>
          <select
            value={enrollmentStatus}
            onChange={(e) => setEnrollmentStatus(e.target.value)}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          >
            <option value="all">All Enrollment</option>
            <option value="enrolled">Enrolled</option>
            <option value="not_enrolled">Not Enrolled</option>
          </select>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-[24px] border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-[var(--admin-text)]">
          {error}
        </div>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--admin-soft)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-5 py-4">Applicant</th>
                <th className="px-5 py-4">Interest</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Schedule</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--admin-muted)]">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && applicants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--admin-muted)]">
                    No applicants found.
                  </td>
                </tr>
              )}
              {!loading &&
                applicants.map((applicant) => (
                  <tr key={applicant._id} className="border-t border-[var(--admin-border)]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--admin-text)]">
                        {applicant.personal_info.first_name} {applicant.personal_info.last_name}
                      </p>
                      <p className="mt-1 text-[var(--admin-muted)]">{applicant.personal_info.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={applicant.interest_status} colorFn={interestStatusColor} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={applicant.payment_status} colorFn={paymentStatusColor} />
                    </td>
                    <td className="px-5 py-4 text-[var(--admin-text)]">{formatCurrency(applicant.price)}</td>
                    <td className="px-5 py-4 text-[var(--admin-text)]">
                      {applicant.assigned_schedule?.name || (
                        <span className="text-[var(--admin-muted)]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/applicants/${applicant._id}`}
                        className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-[var(--admin-bg)]"
                      >
                        Open
                      </Link>
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

export default Applicants;
