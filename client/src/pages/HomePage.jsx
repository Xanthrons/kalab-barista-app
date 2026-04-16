import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import AppBackdrop from "../components/AppBackdrop";
import CustomPopup from "../components/CustomPopup";
import FeatureCard from "../components/FeatureCard";
import useApplicantStatus from "../hooks/useApplicantStatus";
import useTelegramWebApp from "../hooks/useTelegramWebApp";
import { formatScheduleSummary } from "../utils/formatters";

const features = [
  {
    title: "Student Portal",
    description: "Track payment status, cohort assignment, and launch readiness.",
    route: "/portal",
    gated: true
  },
  {
    title: "Course Browsing",
    description: "Explore the full academy path with curriculum highlights and class formats.",
    route: "/courses"
  },
  {
    title: "Enrollment",
    description: "Complete your registration and lock in your place in the next cohort.",
    route: "/register"
  },
  {
    title: "Profile Management",
    description: "Review your details, emergency contact, and academy preferences.",
    route: "/profile",
    gated: true
  },
  {
    title: "Cafe Menu",
    description: "A curated drinks and bites menu will arrive here soon for students.",
    placeholder: true
  }
];

function HomePage() {
  const navigate = useNavigate();
  const { telegramUser, haptic } = useTelegramWebApp();
  const { applicant, isRegistered } = useApplicantStatus(telegramUser.id);
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    actions: []
  });

  const heroAction = useMemo(() => {
    if (isRegistered) {
      return {
        label: "Open Student Portal",
        onClick: () => navigate("/portal")
      };
    }

    return {
      label: "Register Now",
      onClick: () => navigate("/register")
    };
  }, [isRegistered, navigate]);

  const handleFeatureClick = (feature) => {
    haptic("light");

    if (feature.placeholder) {
      setPopup({
        isOpen: true,
        title: "Cafe Menu Coming Soon",
        message:
          "We are brewing a student cafe menu experience for the next release.",
        type: "info",
        actions: [
          {
            label: "Close",
            onClick: () => setPopup({ isOpen: false }),
            primary: true
          }
        ]
      });
      return;
    }

    if (feature.gated && !isRegistered) {
      setPopup({
        isOpen: true,
        title: "Registration Required",
        message:
          "This area unlocks after registration. Continue to the application form now?",
        type: "warning",
        actions: [
          {
            label: "Register Now",
            onClick: () => {
              setPopup({ isOpen: false });
              navigate("/register");
            },
            primary: true
          },
          {
            label: "Maybe Later",
            onClick: () => setPopup({ isOpen: false })
          }
        ]
      });
      return;
    }

    navigate(feature.route);
  };

  return (
    <AppBackdrop>
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hero-orbit overflow-hidden rounded-[36px] border border-coffee-border/70 px-6 py-8 sm:px-10 sm:py-12"
          >
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <img
                    src={logo}
                    alt="Kalab Barista Academy"
                    className="h-20 w-20 rounded-[28px] object-contain shadow-soft"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                      Telegram Mini App
                    </p>
                    <h1 className="font-display text-5xl font-semibold leading-none text-coffee-text sm:text-6xl">
                      Kalab Barista Academy
                    </h1>
                  </div>
                </div>

                <p className="max-w-2xl text-lg leading-8 text-coffee-muted sm:text-xl">
                  Unveil the Science Behind Every Cup
                </p>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-coffee-muted/90 sm:text-base">
                  A refined admissions journey for future baristas, with program discovery,
                  Telegram-first follow-up, payment handling, and student access in one place.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={heroAction.onClick}
                    className="premium-button rounded-2xl px-6 py-3.5 text-sm font-bold text-coffee-bg"
                  >
                    {heroAction.label}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/courses")}
                    className="rounded-2xl border border-coffee-border bg-white/5 px-6 py-3.5 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
                  >
                    Explore Courses
                  </motion.button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="glass-card rounded-[28px] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                    Registration State
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-coffee-text">
                        {isRegistered ? "Registered" : "Not Registered"}
                      </p>
                      <p className="mt-2 text-sm text-coffee-muted">
                        {isRegistered
                          ? "Your student tools are unlocked inside the mini app."
                          : "Register to unlock your profile, payment status, and schedule."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-coffee-accent/30 bg-coffee-accent/10 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-coffee-accent/80">
                        Telegram
                      </p>
                      <p className="mt-1 text-sm text-coffee-text/90">
                        {telegramUser.username ? `@${telegramUser.username}` : "Preview mode"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-[28px] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-coffee-accent/80">
                    Current Snapshot
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-coffee-muted">
                    <div className="flex items-center justify-between gap-4">
                      <span>Payment</span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-coffee-text">
                        {applicant?.payment_status || "pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Interest</span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-coffee-text">
                        {applicant?.interest_status || "interested"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-[0.2em] text-coffee-accent/80">
                        Assigned Schedule
                      </span>
                      <p className="mt-2 text-coffee-text/90">
                        {formatScheduleSummary(applicant?.assigned_schedule)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="mt-10">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                Experience
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-coffee-text">
                Your coffee learning hub
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {features.map((feature) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => handleFeatureClick(feature)}
                  className="text-left"
                >
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={
                      <span className="text-lg font-semibold">
                        {feature.title.charAt(0)}
                      </span>
                    }
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <CustomPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        actions={popup.actions}
      />
    </AppBackdrop>
  );
}

export default HomePage;
