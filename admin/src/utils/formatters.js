export function formatDate(value) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString()} ETB`;
}

export function scheduleLabel(schedule) {
  if (!schedule) {
    return "Unassigned";
  }

  return `${schedule.name} • ${schedule.type} • ${schedule.days.join(", ")} • ${schedule.time}`;
}
