import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../hooks/useTelegramWebApp";

function SuccessState({ showHomeButton = true }) {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-[30px] border-emerald-400/20 bg-[linear-gradient(180deg,rgba(32,93,70,0.22),rgba(17,26,20,0.4))] p-6 text-center shadow-soft"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/20"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-10 w-10 text-emerald-300"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </motion.div>
      <h2 className="mt-5 text-2xl font-bold text-coffee-text">
        {t("registrationReceived")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-coffee-muted">
        {t("registrationSuccess")}
      </p>

      {showHomeButton && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-coffee-accent text-coffee-bg rounded-xl font-medium hover:bg-coffee-accent/90 transition-colors duration-200"
        >
          {t("goToHome")}
        </motion.button>
      )}
    </motion.div>
  );
}

export default SuccessState;
