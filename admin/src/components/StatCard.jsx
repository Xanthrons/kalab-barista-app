function StatCard({ label, value, tone = "accent" }) {
  const colorMap = {
    accent: "var(--admin-accent)",
    success: "var(--admin-success)",
    warning: "var(--admin-warning)",
    danger: "var(--admin-danger)",
  };
  return (
    <div className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-5 shadow-panel">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold" style={{ color: colorMap[tone] || colorMap.accent }}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;
