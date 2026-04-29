import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../hooks/useTelegramWebApp";

function BackButton({ to = "/", label = "" }) {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 rounded-xl border border-coffee-border bg-white/5 px-4 py-2.5 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label || t("back")}
    </button>
  );
}

export default BackButton;
