import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Applicants", to: "/applicants" },
  { label: "Schedules", to: "/schedules" }
];

function AdminShell({ title, subtitle, actions = null, children }) {
  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[28px] border border-admin-border bg-admin-panel p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.32em] text-admin-accent/80">
            Kalab Admin
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-admin-text">
            Admissions Desk
          </h1>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-admin-accent text-admin-bg"
                      : "bg-admin-soft text-admin-text hover:bg-admin-border"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <header className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-admin-accent/80">
                  Workspace
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-admin-text">
                  {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-admin-muted">
                  {subtitle}
                </p>
              </div>
              {actions}
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
