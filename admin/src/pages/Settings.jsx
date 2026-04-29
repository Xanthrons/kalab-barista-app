import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { getSystemSettings, updateSystemSettings } from "../utils/api";

function Settings() {
  const [settings, setSettings] = useState({
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    payment_instructions: "",
    support_contact: ""
  });

  useEffect(() => {
    async function load() {
      const nextSettings = await getSystemSettings();
      setSettings((prev) => ({ ...prev, ...nextSettings }));
    }

    load();
  }, []);

  return (
    <AdminShell
      title="System Settings"
      subtitle="Super admins can manage bank details, payment instructions, and support messaging."
    >
      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-panel">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={settings.bank_name}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, bank_name: event.target.value }))
            }
            placeholder="Bank name"
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          />
          <input
            value={settings.bank_account_name}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                bank_account_name: event.target.value
              }))
            }
            placeholder="Account name"
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          />
          <input
            value={settings.bank_account_number}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                bank_account_number: event.target.value
              }))
            }
            placeholder="Account number"
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          />
          <input
            value={settings.support_contact}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                support_contact: event.target.value
              }))
            }
            placeholder="Support contact"
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none"
          />
          <textarea
            value={settings.payment_instructions}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                payment_instructions: event.target.value
              }))
            }
            placeholder="Payment instructions"
            className="min-h-[140px] rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none md:col-span-2"
          />
        </div>
        <button
          type="button"
          onClick={async () => {
            const nextSettings = await updateSystemSettings(settings);
            setSettings((prev) => ({ ...prev, ...nextSettings }));
          }}
          className="mt-4 rounded-2xl bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-[var(--admin-bg)]"
        >
          Save Settings
        </button>
      </section>
    </AdminShell>
  );
}

export default Settings;
