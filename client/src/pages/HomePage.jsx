import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import AppBackdrop from "../components/AppBackdrop";
import useApplicantStatus from "../hooks/useApplicantStatus";
import useTelegramWebApp, { useAppPreferences } from "../hooks/useTelegramWebApp";

function HomePage() {
  const navigate = useNavigate();
  const { telegramUser, haptic } = useTelegramWebApp();
  const { t } = useAppPreferences();
  const { isRegistered } = useApplicantStatus(telegramUser.id);

  return (
    <AppBackdrop>
      <div className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hero-orbit overflow-hidden rounded-[32px] px-6 py-8 sm:px-10 sm:py-12"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={logo}
                  alt="Kalab Barista Academy"
                  className="h-16 w-16 rounded-2xl object-contain shadow-soft"
                />
                <div>
                  <h1 className="mt-2 text-3xl font-extrabold text-coffee-text sm:text-4xl">
                    {t("appName")}
                  </h1>
                </div>
              </div>

              {isRegistered ? (
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-coffee-border bg-white/5 text-coffee-text transition hover:bg-white/10"
                  aria-label={t("openProfile")}
                >
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
                      d="M5.121 17.804A11.955 11.955 0 0112 15c2.53 0 4.877.785 6.879 2.124M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="mt-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-coffee-accent/80">
                {telegramUser.first_name
                  ? t("welcomeNamed", { name: telegramUser.first_name })
                  : t("welcome")}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight text-coffee-text sm:text-5xl">
                {t("subtitle")}
              </h2>
              <p className="mt-5 text-base leading-8 text-coffee-muted">
                {t("heroDescription")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    haptic("light");
                    navigate(isRegistered ? "/portal" : "/register");
                  }}
                  className="premium-button rounded-xl px-6 py-3.5 text-sm font-bold text-coffee-bg"
                >
                  {isRegistered ? t("studentPortal") : t("registerNow")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    haptic("light");
                    navigate("/courses");
                  }}
                  className="rounded-xl border border-coffee-border bg-white/5 px-6 py-3.5 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
                >
                  {t("exploreCourse")}
                </motion.button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </AppBackdrop>
  );
}

export default HomePage;
