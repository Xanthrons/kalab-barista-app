import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppBackdrop from "../components/AppBackdrop";

const courses = [
  {
    title: "Barista Fundamentals",
    duration: "2 weeks",
    description:
      "Master espresso calibration, milk texture, bar flow, and service discipline.",
    topics: [
      "Coffee origins",
      "Dialing espresso",
      "Milk steaming",
      "Drink building",
      "Service rhythm"
    ],
    level: "Beginner"
  },
  {
    title: "Advanced Brewing Methods",
    duration: "1 week",
    description:
      "Refine extraction control and sensory accuracy across manual brew methods.",
    topics: [
      "Pour-over mastery",
      "French press brewing",
      "Cold brew process",
      "Water chemistry",
      "Taste profiling"
    ],
    level: "Intermediate"
  },
  {
    title: "Latte Art & Presentation",
    duration: "1 week",
    description:
      "Build repeatable milk quality and polished presentation with confident service.",
    topics: [
      "Advanced latte art",
      "Cup selection",
      "Presentation skills",
      "Customer service",
      "Quality control"
    ],
    level: "Intermediate"
  },
  {
    title: "Business & Operations",
    duration: "1 week",
    description:
      "Learn pricing, inventory, workflow design, and quality systems for real cafes.",
    topics: [
      "Inventory management",
      "Pricing strategies",
      "Customer relations",
      "Quality standards",
      "Business planning"
    ],
    level: "Advanced"
  }
];

function CourseOverviewPage() {
  const navigate = useNavigate();

  return (
    <AppBackdrop>
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="text-xs uppercase tracking-[0.34em] text-coffee-accent/80">
              Course Overview
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-coffee-text">
              Learn the craft behind every cup
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-coffee-muted">
              Explore a curriculum designed to take students from coffee basics to
              professional service standards and cafe operations.
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card relative overflow-hidden rounded-[32px] p-4"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.12),rgba(0,0,0,0.42))]" />
            <div className="relative aspect-video overflow-hidden rounded-[28px]">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="Kalab Barista Academy Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.section>

          <section className="mt-10 grid gap-5 md:grid-cols-2">
            {courses.map((course, index) => (
              <motion.article
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="glass-card rounded-[30px] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-coffee-accent/80">
                      {course.level}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-coffee-text">
                      {course.title}
                    </h2>
                  </div>
                  <span className="rounded-full border border-coffee-border bg-white/5 px-3 py-1 text-xs text-coffee-text">
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

          <section className="mt-10 glass-card rounded-[32px] p-8 text-center">
            <h2 className="font-display text-4xl font-semibold text-coffee-text">
              Ready to join the next cohort?
            </h2>
            <p className="mt-4 text-sm leading-7 text-coffee-muted">
              Apply now and continue the conversation in Telegram for payment, scheduling,
              and class updates.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="premium-button rounded-2xl px-6 py-3.5 text-sm font-bold text-coffee-bg"
              >
                Register Now
              </button>
              <button
                onClick={() => navigate("/")}
                className="rounded-2xl border border-coffee-border bg-white/5 px-6 py-3.5 text-sm font-semibold text-coffee-text transition hover:bg-white/10"
              >
                Back to Home
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppBackdrop>
  );
}

export default CourseOverviewPage;
