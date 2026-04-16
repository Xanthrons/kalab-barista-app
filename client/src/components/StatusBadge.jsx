function StatusBadge({ status }) {
  const tone =
    status === "paid"
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
      : "border-amber-400/40 bg-amber-500/10 text-amber-100";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${tone}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
