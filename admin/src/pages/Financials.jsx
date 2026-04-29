import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { getFinancialSummary, getRevenueStats, getConversionStats } from "../utils/api";
import { formatCurrency } from "../utils/formatters";

// ── Mini stat card ──────────────────────────────────────────────────────────
function KPI({ label, value, sub, color = "var(--admin-accent)" }) {
  return (
    <div className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-5 shadow-panel">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--admin-muted)]">{sub}</p>}
    </div>
  );
}

// ── Bar chart (pure CSS/div) ─────────────────────────────────────────────────
function BarChart({ data = [], color = "var(--admin-accent)" }) {
  if (!data.length) return <p className="text-sm text-[var(--admin-muted)]">No data for this period.</p>;
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="mt-6 flex items-end gap-1.5 h-48 overflow-x-auto pb-1">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 min-w-[28px] flex-col items-center gap-1 group relative">
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-3 py-2 text-xs text-[var(--admin-text)] shadow-panel whitespace-nowrap">
              <p className="font-semibold">{formatCurrency(d.amount)}</p>
              <p className="text-[var(--admin-muted)]">{d.label}</p>
            </div>
          </div>
          <div
            className="w-full rounded-t-lg transition-all duration-300"
            style={{ height: `${(d.amount / max) * 100}%`, minHeight: d.amount > 0 ? 6 : 2, background: d.amount > 0 ? color : "var(--admin-border)" }}
          />
          <p className="text-[10px] text-[var(--admin-muted)] truncate w-full text-center">{d.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ segments = [] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (!total) return <p className="text-sm text-[var(--admin-muted)]">No data available.</p>;
  let offset = 0;
  const r = 60, cx = 80, cy = 80, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg viewBox="0 0 160 160" className="h-40 w-40 flex-shrink-0">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth="28" strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ} transform="rotate(-90 80 80)"
              style={{ transition: "stroke-dasharray 0.4s" }} />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--admin-text)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="var(--admin-muted)">total</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-[var(--admin-text)]">{seg.label}</span>
            <span className="ml-auto font-semibold text-[var(--admin-text)]">{seg.value}</span>
            <span className="text-[var(--admin-muted)] text-xs">({((seg.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Funnel bar ───────────────────────────────────────────────────────────────
function FunnelBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--admin-text)]">{label}</span>
        <span className="font-semibold text-[var(--admin-text)]">{value}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-[var(--admin-soft)]">
        <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Financials() {
  const [financial, setFinancial] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [conversion, setConversion] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [fin, rev, conv] = await Promise.all([
        getFinancialSummary(), getRevenueStats(period), getConversionStats()
      ]);
      setFinancial(fin);
      setRevenue(Array.isArray(rev) ? rev : []);
      setConversion(conv);
    } catch {
      setError("Failed to load financial data. Make sure analytics routes are registered on the server.");
    } finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const convRate = conversion?.total > 0
    ? ((conversion.enrolled / conversion.total) * 100).toFixed(1)
    : "0.0";

  return (
    <AdminShell
      title="Financial Reports"
      subtitle="Revenue analytics, conversion funnel, and enrollment breakdown — Super Admin only."
    >
      {error && (
        <div className="rounded-[24px] border border-[var(--admin-danger)]/40 bg-[var(--admin-danger)]/10 px-4 py-3 text-sm text-[var(--admin-text)]">
          {error}
        </div>
      )}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total Revenue" value={loading ? "…" : formatCurrency(financial?.total_revenue)} color="var(--admin-success)" />
        <KPI label="This Month" value={loading ? "…" : formatCurrency(financial?.monthly_revenue)} />
        <KPI label="Avg. / Student" value={loading ? "…" : formatCurrency(financial?.avg_per_student)} />
        <KPI label="Paid Students" value={loading ? "…" : financial?.total_paid_students ?? 0} sub="Enrolled so far" />
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
              <button key={p} onClick={() => setPeriod(p)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  period === p
                    ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]"
                    : "bg-[var(--admin-soft)] text-[var(--admin-text)] hover:bg-[var(--admin-border)]"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {loading ? <p className="mt-6 text-sm text-[var(--admin-muted)]">Loading chart…</p> : (
          <BarChart data={revenue} color="var(--admin-accent)" />
        )}
      </section>

      {/* Two-column: donut + funnel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment breakdown donut */}
        <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Enrollment Breakdown</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">By Status</h3>
          <div className="mt-6">
            {loading ? <p className="text-sm text-[var(--admin-muted)]">Loading…</p> : (
              <DonutChart segments={[
                { label: "Enrolled (Paid)", value: conversion?.enrolled || 0, color: "var(--admin-success)" },
                { label: "Interested, Pending", value: Math.max(0, (conversion?.interested || 0) - (conversion?.enrolled || 0)), color: "var(--admin-warning)" },
                { label: "Not Interested", value: Math.max(0, (conversion?.total || 0) - (conversion?.interested || 0)), color: "var(--admin-danger)" },
              ]} />
            )}
          </div>
        </section>

        {/* Conversion funnel */}
        <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Conversion Funnel</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">Applicant → Enrolled</h3>
          <div className="mt-6 space-y-4">
            {loading ? <p className="text-sm text-[var(--admin-muted)]">Loading…</p> : (
              <>
                <FunnelBar label="Total Applicants" value={conversion?.total || 0} max={conversion?.total || 1} color="var(--admin-muted)" />
                <FunnelBar label="Interested" value={conversion?.interested || 0} max={conversion?.total || 1} color="var(--admin-warning)" />
                <FunnelBar label="Payment Requested" value={conversion?.payment_sent || 0} max={conversion?.total || 1} color="var(--admin-accent)" />
                <FunnelBar label="Enrolled (Paid)" value={conversion?.enrolled || 0} max={conversion?.total || 1} color="var(--admin-success)" />
              </>
            )}
          </div>
          {!loading && conversion && (
            <div className="mt-6 rounded-2xl border border-[var(--admin-success)]/30 bg-[var(--admin-success)]/10 px-4 py-3 text-sm">
              <span className="text-[var(--admin-muted)]">Overall conversion rate: </span>
              <span className="font-semibold text-[var(--admin-success)]">{convRate}%</span>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

export default Financials;
