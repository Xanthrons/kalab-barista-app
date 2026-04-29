function ToggleGroup({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  onBlur,
  idPrefix = "toggle",
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-coffee-text">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              id={`${idPrefix}-${String(option.value)}`}
              type="button"
              onClick={() => onChange(option.value)}
              onBlur={onBlur}
              aria-pressed={active}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                active
                  ? "border-coffee-accent bg-coffee-accent text-coffee-bg shadow-soft"
                  : "border-coffee-border bg-coffee-bg/50 text-coffee-text hover:border-coffee-accent/70"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <span className="mt-2 block text-xs text-red-300">{error}</span>
      ) : null}
    </div>
  );
}

export default ToggleGroup;
