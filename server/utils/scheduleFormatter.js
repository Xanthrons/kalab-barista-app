function formatDate(value) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatScheduleSummary(schedule) {
  if (!schedule) {
    return "Schedule not assigned yet.";
  }

  return `${schedule.name} • ${schedule.type} • ${schedule.days.join(", ")} • ${schedule.time}`;
}

function formatScheduleMessage(schedule) {
  if (!schedule) {
    return "Your class schedule will be shared soon.";
  }

  return [
    "Your payment has been approved and your seat is confirmed.",
    "",
    `Class: ${schedule.name}`,
    `Track: ${schedule.type}`,
    `Start Date: ${formatDate(schedule.start_date)}`,
    `Days: ${schedule.days.join(", ")}`,
    `Time: ${schedule.time}`,
    `Instructor: ${schedule.instructor}`,
    "",
    "Please arrive 15 minutes early and bring a notebook for your first session."
  ].join("\n");
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysUntil(date, from = new Date()) {
  const diff = startOfDay(date).getTime() - startOfDay(from).getTime();
  return Math.round(diff / 86400000);
}

function getReminderOffsets() {
  return [7, 3, 1];
}

module.exports = {
  formatDate,
  formatScheduleSummary,
  formatScheduleMessage,
  getDaysUntil,
  getReminderOffsets
};
