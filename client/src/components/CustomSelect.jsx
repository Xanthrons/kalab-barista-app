import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function CustomSelect({
  id,
  label,
  value,
  onChange,
  error,
  options,
  placeholder,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const dropdownHeight = 240; // Approximate height of dropdown
      const dropdownWidth = rect.width;

      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;

      // If there's not enough space below, position above
      if (top + dropdownHeight > window.scrollY + windowHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 8;
      }

      // Ensure it doesn't go off the right edge
      if (left + dropdownWidth > windowWidth) {
        left = windowWidth - dropdownWidth - 16;
      }

      // Ensure it doesn't go off the left edge
      if (left < 16) {
        left = 16;
      }

      setDropdownPosition({ top, left, width: rect.width });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        selectRef.current &&
        !selectRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <label className={`block relative ${className}`} htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-coffee-text">
        {label}
      </span>
      <div className="relative">
        <button
          ref={selectRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`field-ring w-full rounded-2xl border bg-coffee-card/40 backdrop-blur-sm px-4 py-3.5 text-sm text-left outline-none transition focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/25 ${
            error ? "border-red-400/70" : "border-coffee-border/50"
          }`}
        >
          <span
            className={
              selectedOption ? "text-coffee-text" : "text-coffee-muted"
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 text-coffee-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[9999] backdrop-blur-xl bg-coffee-card/95 border border-coffee-border/50 rounded-2xl shadow-glow max-h-60 overflow-y-auto"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full px-4 py-3 text-left text-sm transition-all hover:bg-coffee-accent/10 first:rounded-t-2xl last:rounded-b-2xl ${
                    value === option.value
                      ? "bg-coffee-accent/20 text-coffee-accent font-medium"
                      : "text-coffee-text hover:text-coffee-accent"
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error ? (
        <span className="mt-2 block text-xs text-red-300">{error}</span>
      ) : null}
    </label>
  );
}

export default CustomSelect;
