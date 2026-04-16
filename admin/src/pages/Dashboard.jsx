import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import StatCard from "../components/StatCard";
import { getApplicantStats, getApplicants } from "../utils/api";
import { formatDate } from "../utils/formatters";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState([]);

  useEffect(() => {
    async function load() {
      const [nextStats, applicantResponse] = await Promise.all([
        getApplicantStats(),
        getApplicants()
      ]);
      setStats(nextStats);
      setRecentApplicants(applicantResponse.data.slice(0, 5));
    }

    load();
  }, []);

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Monitor applicant volume, payment progress, and schedule readiness across the academy."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Applicants" value={stats?.total || 0} />
        <StatCard label="Interested" value={stats?.interested || 0} tone="success" />
        <StatCard label="Pending Payment" value={stats?.pending || 0} tone="warning" />
        <StatCard label="Schedules Assigned" value={stats?.schedules_assigned || 0} />
      </div>

      <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-admin-muted">
              Recent Applicants
            </p>
            <h3 className="mt-2 text-xl font-semibold text-admin-text">
              Latest registrations
            </h3>
          </div>
          <Link
            to="/applicants"
            className="rounded-2xl bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-bg"
          >
            View All
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {recentApplicants.map((applicant) => (
            <Link
              key={applicant._id}
              to={`/applicants/${applicant._id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-admin-border bg-admin-soft px-4 py-4 transition hover:border-admin-accent/40"
            >
              <div>
                <p className="font-semibold text-admin-text">
                  {applicant.personal_info.first_name} {applicant.personal_info.last_name}
                </p>
                <p className="mt-1 text-sm text-admin-muted">
                  {applicant.personal_info.email}
                </p>
              </div>
              <div className="text-right text-sm text-admin-muted">
                <p>{formatDate(applicant.createdAt)}</p>
                <p className="mt-1 text-admin-text">{applicant.payment_status}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

export default Dashboard;
