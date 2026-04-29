import { useEffect, useMemo, useState } from "react";
import { useAppPreferences } from "../hooks/useTelegramWebApp";

function parseDateValue(value = "") {
  const [rawDay = "", rawMonth = "", rawYear = ""] = String(value).split("/");

  return {
    day: rawDay ? String(Number(rawDay)) : "",
    month: rawMonth ? String(Number(rawMonth)) : "",
    year: rawYear ? String(Number(rawYear)) : "",
  };
}

function formatDateValue(day, month, year) {
  if (!day && !month && !year) {
    return "";
  }

  const paddedDay = day ? String(day).padStart(2, "0") : "";
  const paddedMonth = month ? String(month).padStart(2, "0") : "";

  return `${paddedDay}/${paddedMonth}/${year || ""}`;
}

function DatePicker({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  className = "",
  required = false,
}) {
  const { months, t } = useAppPreferences();
  const currentYear = new Date().getFullYear();
  const [parts, setParts] = useState(() => parseDateValue(value));

  useEffect(() => {
    setParts(parseDateValue(value));
  }, [value]);

  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, index) => String(index + 1)),
    [],
  );

  const yearOptions = useMemo(
    () =>
      Array.from({ length: currentYear - 1950 + 1 }, (_, index) =>
        String(currentYear - index),
      ),
    [currentYear],
  );

  const updatePart = (field, nextValue) => {
    const nextParts = {
      ...parts,
      [field]: nextValue,
    };

    setParts(nextParts);
    onChange({
      target: {
        value: formatDateValue(nextParts.day, nextParts.month, nextParts.year),
      },
    });
  };

  const selectClassName = `field-ring w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-sm text-coffee-text outline-none transition focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/25 ${
    error ? "border-red-400/70" : "border-coffee-border"
  }`;

  return (
    <div className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-coffee-text">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <div className="grid grid-cols-3 gap-3">
        <label htmlFor={`${id}_day`} className="block relative">
          <select
            id={`${id}_day`}
            value={parts.day}
            onChange={(event) => updatePart("day", event.target.value)}
            onBlur={onBlur}
            className={`${selectClassName} appearance-none pr-10`}
          >
            <option value="" className="bg-coffee-card text-coffee-text">
              {t("chooseDay")}
            </option>
            {dayOptions.map((day) => (
              <option
                key={day}
                value={day}
                className="bg-coffee-card text-coffee-text"
              >
                {day}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-coffee-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7L10 12L15 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </label>

        <label htmlFor={`${id}_month`} className="block relative">
          <select
            id={`${id}_month`}
            value={parts.month}
            onChange={(event) => updatePart("month", event.target.value)}
            onBlur={onBlur}
            className={`${selectClassName} appearance-none pr-10`}
          >
            <option value="" className="bg-coffee-card text-coffee-text">
              {t("selectMonth")}
            </option>
            {months.map((monthLabel, index) => (
              <option
                key={monthLabel}
                value={String(index + 1)}
                className="bg-coffee-card text-coffee-text"
              >
                {monthLabel}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-coffee-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7L10 12L15 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </label>

        <label htmlFor={`${id}_year`} className="block relative">
          <select
            id={`${id}_year`}
            value={parts.year}
            onChange={(event) => updatePart("year", event.target.value)}
            onBlur={onBlur}
            className={`${selectClassName} appearance-none pr-10`}
          >
            <option value="" className="bg-coffee-card text-coffee-text">
              {t("selectYear")}
            </option>
            {yearOptions.map((year) => (
              <option
                key={year}
                value={year}
                className="bg-coffee-card text-coffee-text"
              >
                {year}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-coffee-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7L10 12L15 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </label>
      </div>

      {hint ? (
        <span className="mt-2 block text-xs text-coffee-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-2 block text-xs text-red-300">{error}</span>
      ) : null}
    </div>
  );
}

export default DatePicker;
