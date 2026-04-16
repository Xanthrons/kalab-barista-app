function StatCard({ label, value, tone = "accent" }) {
  const toneMap = {
    accent: "text-admin-accent",
    success: "text-admin-success",
    warning: "text-admin-warning"
  };

  return (
    <div className="rounded-[24px] border border-admin-border bg-admin-panel p-5 shadow-panel">
      <p className="text-xs uppercase tracking-[0.28em] text-admin-muted">
        {label}
      </p>
      <p className={`mt-4 text-3xl font-semibold ${toneMap[tone] || toneMap.accent}`}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;
