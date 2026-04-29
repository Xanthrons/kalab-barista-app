import { motion } from "framer-motion";
import { useAppPreferences } from "../hooks/useTelegramWebApp";

function AppBackdrop({ children }) {
  const { theme, language, toggleTheme, setPreferredLanguage, t } =
    useAppPreferences();

  return (
    <div className="relative min-h-screen overflow-hidden bg-coffee-bg text-coffee-text">
      <div className="coffee-noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-[-12rem] h-[32rem] bg-[radial-gradient(circle_at_top,rgba(212,163,115,0.2),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-16rem] h-[30rem] bg-[radial-gradient(circle_at_bottom,rgba(112,63,33,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-coffee-texture opacity-25" />
      <span className="bean left-[8%] top-[10%] h-14 w-9 opacity-60" />
      <span className="bean right-[11%] top-[18%] h-10 w-6 opacity-40" />
      <span className="bean bottom-[18%] left-[10%] h-12 w-7 opacity-35" />
      <span className="bean bottom-[14%] right-[12%] h-16 w-10 opacity-45" />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed right-4 top-4 z-30 flex items-center gap-2 rounded-2xl border border-coffee-border/60 bg-coffee-card/75 px-2 py-2 shadow-soft backdrop-blur-xl"
      >
        <div className="flex items-center rounded-xl border border-coffee-border/60 bg-white/5 p-1">
          {[
            { label: t("languageEnglish"), value: "en" },
            { label: t("languageAmharic"), value: "am" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreferredLanguage(option.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                language === option.value
                  ? "bg-coffee-accent text-coffee-bg"
                  : "text-coffee-text hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-coffee-border/60 bg-white/5 text-coffee-text transition hover:bg-white/10"
          aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
        >
          {theme === "dark" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v2.5M12 18.5V21m9-9h-2.5M5.5 12H3m15.864 6.364l-1.768-1.768M7.904 7.904L6.136 6.136m12.728 0l-1.768 1.768M7.904 16.096l-1.768 1.768M12 16a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 1012 21a8.97 8.97 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </motion.div>
      <div className="relative z-10 min-h-screen overflow-auto">{children}</div>
    </div>
  );
}

export default AppBackdrop;
