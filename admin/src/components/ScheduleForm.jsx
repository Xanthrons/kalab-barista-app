import { useEffect, useState } from "react";

const emptySchedule = {
  name: "",
  type: "Morning",
  start_date: "",
  days: [],
  time: "",
  instructor: ""
};

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ScheduleForm({ initialValue, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState(emptySchedule);

  useEffect(() => {
    setForm(
      initialValue
        ? {
            ...initialValue,
            start_date: initialValue.start_date?.slice(0, 10) || "",
            days: initialValue.days || []
          }
        : emptySchedule
    );
  }, [initialValue]);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((entry) => entry !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4 rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Cohort name"
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
        />
        <select
          value={form.type}
          onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Weekend">Weekend</option>
        </select>
        <input
          type="date"
          value={form.start_date}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, start_date: event.target.value }))
          }
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
        />
        <input
          value={form.time}
          onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
          placeholder="10:00 - 12:00"
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
        />
        <input
          value={form.instructor}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, instructor: event.target.value }))
          }
          placeholder="Instructor name"
          className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none md:col-span-2"
        />
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-admin-muted">
          Class Days
        </p>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                form.days.includes(day)
                  ? "bg-admin-accent text-admin-bg"
                  : "bg-admin-soft text-admin-text"
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
          className="rounded-2xl bg-admin-accent px-5 py-3 text-sm font-semibold text-admin-bg disabled:opacity-60"
        >
          {submitting ? "Saving..." : initialValue ? "Update Schedule" : "Create Schedule"}
        </button>
        {initialValue ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-admin-border bg-admin-soft px-5 py-3 text-sm font-semibold text-admin-text"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default ScheduleForm;
