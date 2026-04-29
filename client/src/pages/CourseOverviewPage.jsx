import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import AppBackdrop from "../components/AppBackdrop";
import { useAppPreferences } from "../hooks/useTelegramWebApp";

function CourseOverviewPage() {
  const { t } = useAppPreferences();

  const courses = [
    {
      title: t("baristaFundamentals"),
      duration: t("twoWeeks"),
      description: t("baristaFundamentalsDescription"),
      topics: [
        t("coffeeOrigins"),
        t("dialingEspresso"),
        t("milkSteaming"),
        t("drinkBuilding"),
        t("serviceRhythm")
      ],
      level: t("beginner")
    },
    {
      title: t("advancedBrewing"),
      duration: t("oneWeek"),
      description: t("advancedBrewingDescription"),
      topics: [
        t("pourOverMastery"),
        t("frenchPressBrewing"),
        t("coldBrewProcess"),
        t("waterChemistry"),
        t("tasteProfiling")
      ],
      level: t("intermediate")
    }
  ];

  return (
    <AppBackdrop>
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
                {t("courseOverview")}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold text-coffee-text">
                {t("courseTitle")}
              </h1>
            </div>
            <BackButton to="/" label={t("home")} />
          </div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card relative overflow-hidden rounded-[24px] p-4"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.08),rgba(0,0,0,0.38))]" />
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="Kalab Barista Academy Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.section>

          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {courses.map((course, index) => (
              <motion.article
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.08 }}
                className="glass-card rounded-[24px] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                      {course.level}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-coffee-text">
                      {course.title}
                    </h2>
                  </div>
                  <span className="inline-flex min-w-[96px] shrink-0 items-center justify-center rounded-full border border-coffee-border bg-white/5 px-3 py-1.5 text-sm font-semibold text-coffee-text">
                    {course.duration}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-coffee-muted">
                  {course.description}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-coffee-text/90">
                  {course.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-coffee-accent" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </section>
        </div>
      </div>
    </AppBackdrop>
  );
}

export default CourseOverviewPage;
