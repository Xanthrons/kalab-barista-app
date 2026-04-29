import { useEffect, useState } from "react";

const emptySchedule = {
  name: "",
  type: "Morning",
  start_date: "",
  days: [],
  time: "",
  instructor: "",
  location: "",
  capacity: ""
};

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ScheduleForm({ initialValue, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState(emptySchedule);

  useEffect(() => {
    setForm(
      initialValue
        ? {
            ...emptySchedule,
            ...initialValue,
            start_date: initialValue.start_date?.slice(0, 10) || "",
            days: initialValue.days || [],
            capacity: initialValue.capacity ?? ""
          }
        : emptySchedule
    );
  }, [initialValue]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const toggleDay = (day) => {
    setForm((p) => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter((d) => d !== day) : [...p.days, day]
    }));
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-4 rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel"
    >
      <h3 className="text-xl font-semibold text-[var(--admin-text)]">
        {initialValue ? "Edit Schedule" : "New Schedule"}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={set("name")}
          placeholder="Cohort name"
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        />
        <select
          value={form.type}
          onChange={set("type")}
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Weekend">Weekend</option>
          <option value="Evening">Evening</option>
        </select>
        <input
          type="date"
          value={form.start_date}
          onChange={set("start_date")}
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        />
        <input
          value={form.time}
          onChange={set("time")}
          placeholder="Time (e.g. 10:00 – 12:00)"
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        />
        <input
          value={form.instructor}
          onChange={set("instructor")}
          placeholder="Instructor name"
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        />
        <input
          value={form.location}
          onChange={set("location")}
          placeholder="Location / Room (optional)"
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        />
        <input
          type="number"
          min="1"
          value={form.capacity}
          onChange={set("capacity")}
          placeholder="Max students (optional)"
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
        />
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">Class Days</p>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                form.days.includes(day)
                  ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]"
                  : "bg-[var(--admin-soft)] text-[var(--admin-text)] hover:bg-admin-border"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-[var(--admin-bg)] disabled:opacity-60"
        >
          {submitting ? "Saving…" : initialValue ? "Update Schedule" : "Create Schedule"}
        </button>
        {initialValue && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-5 py-3 text-sm font-semibold text-[var(--admin-text)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ScheduleForm;
