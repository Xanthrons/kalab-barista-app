import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import ScheduleForm from "../components/ScheduleForm";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule
} from "../utils/api";
import { formatDate } from "../utils/formatters";

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const nextSchedules = await getSchedules();
    setSchedules(nextSchedules);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      if (editingSchedule) {
        await updateSchedule(editingSchedule._id, payload);
        setEditingSchedule(null);
      } else {
        await createSchedule(payload);
      }
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell
      title="Schedules"
      subtitle="Create, edit, and remove class schedules that can be assigned to approved students."
    >
      <ScheduleForm
        initialValue={editingSchedule}
        onSubmit={handleSubmit}
        submitting={submitting}
        onCancel={() => setEditingSchedule(null)}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {schedules.map((schedule) => (
          <article
            key={schedule._id}
            className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-admin-muted">
                  {schedule.type}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-admin-text">
                  {schedule.name}
                </h3>
              </div>
              <span className="rounded-full bg-admin-soft px-3 py-1 text-sm text-admin-text">
                {formatDate(schedule.start_date)}
              </span>
            </div>

            <div className="mt-5 space-y-2 text-sm text-admin-muted">
              <p>Days: {schedule.days.join(", ")}</p>
              <p>Time: {schedule.time}</p>
              <p>Instructor: {schedule.instructor}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEditingSchedule(schedule)}
                className="rounded-2xl bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-bg"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  await deleteSchedule(schedule._id);
                  await load();
                }}
                className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-2 text-sm font-semibold text-admin-text"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}

export default Schedules;
