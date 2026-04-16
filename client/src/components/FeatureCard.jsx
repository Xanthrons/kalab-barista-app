import { motion } from "framer-motion";

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-[28px] p-5 transition"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-coffee-accent/14 text-coffee-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-coffee-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-coffee-muted">{description}</p>
    </motion.div>
  );
}

export default FeatureCard;
