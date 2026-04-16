import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function DatePicker({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null,
  );
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const dropdownHeight = 320; // Approximate height of calendar
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
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange({ target: { value: date.toISOString().split("T")[0] } });
    setIsOpen(false);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = selectedDate
      ? selectedDate.getMonth()
      : today.getMonth();
    const currentYear = selectedDate
      ? selectedDate.getFullYear()
      : today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date) => {
    const currentMonth = selectedDate
      ? selectedDate.getMonth()
      : new Date().getMonth();
    const currentYear = selectedDate
      ? selectedDate.getFullYear()
      : new Date().getFullYear();
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  };

  return (
    <label className={`block relative ${className}`} htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-coffee-text">
        {label}
      </span>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          readOnly
          value={formatDate(selectedDate)}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="Select date"
          className={`field-ring w-full rounded-2xl border bg-coffee-card/40 backdrop-blur-sm px-4 py-3.5 text-sm text-coffee-text outline-none transition placeholder:text-coffee-muted/50 focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/25 cursor-pointer ${
            error ? "border-red-400/70" : "border-coffee-border/50"
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-coffee-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={calendarRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[9999] backdrop-blur-xl bg-coffee-card/95 border border-coffee-border/50 rounded-2xl shadow-glow p-4"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-1 rounded-lg hover:bg-coffee-accent/20 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-coffee-text"
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
              </button>

              <h3 className="text-lg font-semibold text-coffee-text">
                {
                  monthNames[
                    selectedDate
                      ? selectedDate.getMonth()
                      : new Date().getMonth()
                  ]
                }{" "}
                {selectedDate
                  ? selectedDate.getFullYear()
                  : new Date().getFullYear()}
              </h3>

              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-1 rounded-lg hover:bg-coffee-accent/20 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-coffee-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-coffee-muted py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`aspect-square rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                    isSelected(date)
                      ? "bg-coffee-accent text-coffee-bg shadow-soft"
                      : isToday(date)
                        ? "bg-coffee-accent/20 text-coffee-accent border border-coffee-accent/50"
                        : isCurrentMonth(date)
                          ? "text-coffee-text hover:bg-coffee-accent/10"
                          : "text-coffee-muted/50 hover:bg-coffee-accent/5"
                  }`}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hint ? (
        <span className="mt-2 block text-xs text-coffee-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-2 block text-xs text-red-300">{error}</span>
      ) : null}
    </label>
  );
}

export default DatePicker;
