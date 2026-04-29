import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAppPreferences } from "../hooks/useTelegramWebApp";

function BrandHeader({ compact = false, showNav = false, rightSlot = null }) {
  const { t } = useAppPreferences();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="Kalab Coffee"
          className={compact ? "h-16 w-16 rounded-2xl object-contain" : "h-20 w-20 rounded-[24px] object-contain"}
        />
        <div>
          <h1 className={compact ? "mt-1 text-3xl font-extrabold" : "mt-2 text-4xl font-extrabold"}>
            {t("appName")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-coffee-muted">
            {t("subtitle")}
          </p>
          {showNav ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-coffee-text/85">
              <Link
                to="/"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-coffee-accent/50 hover:bg-white/10"
              >
                {t("home")}
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-coffee-accent/50 hover:bg-white/10"
              >
                {t("registration")}
              </Link>
              <Link
                to="/courses"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-coffee-accent/50 hover:bg-white/10"
              >
                {t("courses")}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
      {rightSlot}
    </div>
  );
}

export default BrandHeader;
