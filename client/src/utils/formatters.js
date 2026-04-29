function getLanguage() {
  if (typeof window === "undefined") {
    return "en";
  }

  return localStorage.getItem("kalab_language") === "am" ? "am" : "en";
}

export function formatDate(value) {
  const language = getLanguage();

  if (!value) {
    return language === "am" ? "ይጠበቃል" : "TBD";
  }

  return new Intl.DateTimeFormat(language === "am" ? "am-ET" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatCurrency(value) {
  const language = getLanguage();
  const amount = Number(value || 0);

  if (!amount) {
    return language === "am" ? "አልተወሰነም" : "Not set";
  }

  return `${amount.toLocaleString()} ETB`;
}

export function formatScheduleSummary(schedule) {
  const language = getLanguage();

  if (!schedule) {
    return language === "am" ? "መርሃ ግብር ገና አልተመደበም።" : "Schedule not assigned yet.";
  }

  return `${schedule.name} - ${schedule.type} - ${schedule.days.join(", ")} - ${schedule.time}`;
}
