import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function MoonIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function AdminShell({ title, subtitle, actions = null, children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const navItems = [
    { label: "Dashboard",    to: "/",            roles: ["admin", "super_admin"] },
    { label: "Applicants",   to: "/applicants",  roles: ["admin", "super_admin"] },
    { label: "Schedules",    to: "/schedules",   roles: ["admin", "super_admin"] },
    { label: "Financials",   to: "/financials",  roles: ["super_admin"] },
    { label: "Admins",       to: "/admins",      roles: ["super_admin"] },
    { label: "Audit Logs",   to: "/audit-logs",  roles: ["super_admin"] },
    { label: "Settings",     to: "/settings",    roles: ["super_admin"] },
  ].filter((item) => item.roles.includes(user?.role));

  const roleLabel = user?.role === "super_admin" ? "Super Admin" : "Admin";

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-200">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-5 shadow-panel lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--admin-accent)]">Kalab Admin</p>
            <button
              onClick={toggle}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)] p-2 text-[var(--admin-muted)] hover:text-[var(--admin-text)] transition"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--admin-text)]">Admissions Desk</h1>
          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]"
                      : "bg-[var(--admin-soft)] text-[var(--admin-text)] hover:bg-[var(--admin-border)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 border-t border-[var(--admin-border)] pt-6">
            <p className="text-xs text-[var(--admin-muted)]">Signed in as</p>
            <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">{user?.name}</p>
            <span className="mt-1 inline-block rounded-full bg-[var(--admin-soft)] px-2 py-0.5 text-xs uppercase tracking-wide text-[var(--admin-accent)]">
              {roleLabel}
            </span>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          <header className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--admin-accent)]">Workspace</p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--admin-text)]">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--admin-muted)]">{subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                {actions}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-border)] transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
