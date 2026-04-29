import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import {
  getApplicantStats,
  getApplicants,
  getFinancialSummary,
  getRevenueStats,
  getConversionStats
} from "../utils/api";
import { formatDate, formatCurrency, paymentStatusColor, interestStatusColor } from "../utils/formatters";

// Simple bar chart rendered with divs (no external lib needed)
function RevenueChart({ data = [], period }) {
  if (!data.length) return <p className="text-sm text-[var(--admin-muted)]">No revenue data available.</p>;
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="mt-4 flex items-end gap-2 h-36">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <p className="text-[10px] text-[var(--admin-muted)]">{formatCurrency(d.amount)}</p>
          <div
            className="w-full rounded-t-lg bg-[var(--admin-accent)]/80 transition-all"
            style={{ height: `${(d.amount / max) * 100}%`, minHeight: d.amount ? 4 : 2 }}
          />
          <p className="text-[10px] text-[var(--admin-muted)] truncate w-full text-center">{d.label}</p>
        </div>
      ))}
    </div>
  );
}

function SuperAdminDashboard({ stats, recentApplicants }) {
  const [financial, setFinancial] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [conversion, setConversion] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [fin, rev, conv] = await Promise.all([
          getFinancialSummary(),
          getRevenueStats(period),
          getConversionStats()
        ]);
        setFinancial(fin);
        setRevenue(Array.isArray(rev) ? rev : rev?.data || []);
        setConversion(conv);
      } catch {
        // graceful degradation — widgets show individual error states
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  return (
    <>
      {/* Financial KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Applicants" value={stats?.total || 0} />
        <StatCard label="Interested" value={stats?.interested || 0} tone="success" />
        <StatCard label="Pending Payment" value={stats?.pending || 0} tone="warning" />
        <StatCard label="Schedules Assigned" value={stats?.schedules_assigned || 0} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Revenue" value={formatCurrency(financial?.total_revenue)} tone="success" />
        <StatCard label="This Month" value={formatCurrency(financial?.monthly_revenue)} />
        <StatCard label="Avg. Revenue / Student" value={formatCurrency(financial?.avg_per_student)} />
      </div>

      {/* Revenue chart */}
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Revenue Trend</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">Revenue Over Time</h3>
          </div>
          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  period === p
                    ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]"
                    : "bg-[var(--admin-soft)] text-[var(--admin-text)] hover:bg-admin-border"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--admin-muted)]">Loading chart…</p>
        ) : (
          <RevenueChart data={revenue} period={period} />
        )}
      </section>

      {/* Conversion funnel */}
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Conversion Funnel</p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">Applicant → Enrolled</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Applicants", value: conversion?.total || stats?.total || 0 },
            { label: "Payment Sent", value: conversion?.payment_sent || 0 },
            { label: "Enrolled", value: conversion?.enrolled || 0 }
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4 text-center">
              <p className="text-2xl font-semibold text-[var(--admin-text)]">{value}</p>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">{label}</p>
            </div>
          ))}
        </div>
        {conversion && (
          <p className="mt-4 text-sm text-[var(--admin-muted)]">
            Conversion rate:{" "}
            <span className="font-semibold text-[var(--admin-success)]">
              {conversion.total
                ? `${((conversion.enrolled / conversion.total) * 100).toFixed(1)}%`
                : "N/A"}
            </span>
          </p>
        )}
      </section>

      {/* Recent applicants */}
      <RecentApplicants applicants={recentApplicants} />
    </>
  );
}

function AdminDashboard({ stats, recentApplicants }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Applicants" value={stats?.total || 0} />
        <StatCard label="Interested" value={stats?.interested || 0} tone="success" />
        <StatCard label="Pending Payment" value={stats?.pending || 0} tone="warning" />
        <StatCard label="Schedules Assigned" value={stats?.schedules_assigned || 0} />
      </div>
      <RecentApplicants applicants={recentApplicants} />
    </>
  );
}

function RecentApplicants({ applicants }) {
  return (
    <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Recent Applicants</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">Latest registrations</h3>
        </div>
        <Link
          to="/applicants"
          className="rounded-2xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-[var(--admin-bg)]"
        >
          View All
        </Link>
      </div>
      <div className="mt-5 space-y-3">
        {applicants.length === 0 && (
          <p className="text-sm text-[var(--admin-muted)]">No applicants yet.</p>
        )}
        {applicants.map((applicant) => (
          <Link
            key={applicant._id}
            to={`/applicants/${applicant._id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-4 transition hover:border-admin-accent/40"
          >
            <div>
              <p className="font-semibold text-[var(--admin-text)]">
                {applicant.personal_info.first_name} {applicant.personal_info.last_name}
              </p>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">{applicant.personal_info.email}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-[var(--admin-muted)]">{formatDate(applicant.createdAt)}</p>
              <p className={`mt-1 font-semibold capitalize ${paymentStatusColor(applicant.payment_status)}`}>
                {applicant.payment_status}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [nextStats, applicantResponse] = await Promise.all([
          getApplicantStats(),
          getApplicants()
        ]);
        setStats(nextStats);
        setRecentApplicants(applicantResponse.data?.slice(0, 5) || []);
      } catch {
        setError("Failed to load dashboard data. Please refresh.");
      }
    }
    load();
  }, []);

  return (
    <AdminShell
      title="Dashboard"
      subtitle={
        user?.role === "super_admin"
          ? "Executive overview — financial analytics, revenue trends, and full academy performance."
          : "Monitor applicant volume, payment progress, and schedule readiness."
      }
    >
      {error && (
        <div className="rounded-[24px] border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-[var(--admin-text)]">
          {error}
        </div>
      )}
      {user?.role === "super_admin" ? (
        <SuperAdminDashboard stats={stats} recentApplicants={recentApplicants} />
      ) : (
        <AdminDashboard stats={stats} recentApplicants={recentApplicants} />
      )}
    </AdminShell>
  );
}

export default Dashboard;
