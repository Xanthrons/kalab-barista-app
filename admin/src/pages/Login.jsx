import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!identifier || !password) {
      setError("Please enter your username/email and password.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      // Support both username and email login — send as `identifier`
      await login(identifier, password);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4 text-[var(--admin-text)]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-8 shadow-panel"
      >
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--admin-accent)]/80">Kalab Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--admin-text)]">Sign in</h1>
        <p className="mt-2 text-sm leading-7 text-[var(--admin-muted)]">
          Access the admissions dashboard with your admin credentials.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Username or Email"
            autoComplete="username"
            className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none focus:border-admin-accent transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none focus:border-admin-accent transition"
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-[var(--admin-text)]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-2xl bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-[var(--admin-bg)] disabled:opacity-60 transition"
        >
          {submitting ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
