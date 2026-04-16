export function formatDate(value) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatCurrency(value) {
  const amount = Number(value || 0);

  if (!amount) {
    return "Not set";
  }

  return `${amount.toLocaleString()} ETB`;
}

export function formatScheduleSummary(schedule) {
  if (!schedule) {
    return "Schedule not assigned yet.";
  }

  return `${schedule.name} • ${schedule.type} • ${schedule.days.join(", ")} • ${schedule.time}`;
}
