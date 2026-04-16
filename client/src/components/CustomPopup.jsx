import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

function CustomPopup({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  actions = [],
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          textColor: "text-green-400",
        };
      case "warning":
        return {
          icon: "⚠️",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          textColor: "text-yellow-400",
        };
      case "error":
        return {
          icon: "❌",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          textColor: "text-red-400",
        };
      default:
        return {
          icon: "ℹ️",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className={`backdrop-blur-xl ${styles.bgColor} border ${styles.borderColor} rounded-3xl p-8 max-w-md w-full shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`text-4xl ${styles.textColor}`}>
                  {styles.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-coffee-text text-center mb-3">
                {title}
              </h3>

              {/* Message */}
              <p className="text-coffee-muted text-center mb-6 leading-relaxed">
                {message}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {actions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      action.primary
                        ? "bg-coffee-accent text-coffee-bg shadow-soft hover:shadow-glow"
                        : "border border-coffee-border/50 bg-coffee-panel/40 text-coffee-text hover:bg-coffee-panel/60"
                    }`}
                  >
                    {action.label}
                  </motion.button>
                ))}

                {/* Default close button if no actions provided */}
                {actions.length === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-coffee-accent text-coffee-bg rounded-xl font-medium shadow-soft hover:shadow-glow transition-all duration-200"
                  >
                    OK
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CustomPopup;
