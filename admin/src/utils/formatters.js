export function formatDate(value) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString()} ETB`;
}

export function scheduleLabel(schedule) {
  if (!schedule) return "Unassigned";
  return `${schedule.name} • ${schedule.type} • ${(schedule.days || []).join(", ")} • ${schedule.time}`;
}

export function paymentStatusColor(status) {
  const map = { paid: "text-[var(--admin-success)]", pending: "text-[var(--admin-warning)]", rejected: "text-[var(--admin-danger)]" };
  return map[status] || "text-[var(--admin-muted)]";
}

export function interestStatusColor(status) {
  const map = { interested: "text-[var(--admin-success)]", not_interested: "text-[var(--admin-danger)]", pending: "text-[var(--admin-warning)]" };
  return map[status] || "text-[var(--admin-muted)]";
}
