import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";
import ScheduleForm from "../components/ScheduleForm";
import { createSchedule, deleteSchedule, getSchedules, updateSchedule } from "../utils/api";
import { formatDate } from "../utils/formatters";

function Schedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");

  const isSuperAdmin = user?.role === "super_admin";

  const load = async () => {
    try {
      const nextSchedules = await getSchedules();
      setSchedules(nextSchedules);
    } catch {
      setError("Failed to load schedules.");
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError("");
      if (editingSchedule) {
        await updateSchedule(editingSchedule._id, payload);
        setEditingSchedule(null);
      } else {
        await createSchedule(payload);
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save schedule.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      setConfirmDelete(null);
      await load();
    } catch {
      setError("Failed to delete schedule.");
    }
  };

  return (
    <AdminShell
      title="Schedules"
      subtitle="Create, edit, and manage class schedules that can be assigned to approved students."
    >
      {error && (
        <div className="rounded-[24px] border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-[var(--admin-text)]">
          {error}
        </div>
      )}

      <ScheduleForm
        initialValue={editingSchedule}
        onSubmit={handleSubmit}
        submitting={submitting}
        onCancel={() => setEditingSchedule(null)}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {schedules.length === 0 && (
          <p className="text-sm text-[var(--admin-muted)] col-span-2 px-1">No schedules created yet.</p>
        )}
        {schedules.map((schedule) => (
          <article
            key={schedule._id}
            className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--admin-muted)]">{schedule.type}</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{schedule.name}</h3>
              </div>
              <span className="rounded-full bg-[var(--admin-soft)] px-3 py-1 text-sm text-[var(--admin-text)] whitespace-nowrap">
                {formatDate(schedule.start_date)}
              </span>
            </div>

            <div className="mt-5 space-y-1.5 text-sm text-[var(--admin-muted)]">
              <p>Days: <span className="text-[var(--admin-text)]">{schedule.days.join(", ")}</span></p>
              <p>Time: <span className="text-[var(--admin-text)]">{schedule.time}</span></p>
              <p>Instructor: <span className="text-[var(--admin-text)]">{schedule.instructor}</span></p>
              {schedule.location && (
                <p>Location: <span className="text-[var(--admin-text)]">{schedule.location}</span></p>
              )}
              {schedule.capacity != null && (
                <p>Capacity: <span className="text-[var(--admin-text)]">{schedule.capacity} students</span></p>
              )}
            </div>

            <div className="mt-5 flex gap-3 flex-wrap">
              <button
                onClick={() => setEditingSchedule(schedule)}
                className="rounded-2xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-[var(--admin-bg)]"
              >
                Edit
              </button>
              {isSuperAdmin && (
                confirmDelete === schedule._id ? (
                  <>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="rounded-2xl bg-admin-danger/80 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(schedule._id)}
                    className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)]"
                  >
                    Delete
                  </button>
                )
              )}
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}

export default Schedules;
