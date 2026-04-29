function FormTextarea({
  id,
  label,
  error,
  className = "",
  hint,
  required = false,
  maxLength,
  showCount = false,
  value = "",
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-coffee-text">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <textarea
        id={id}
        maxLength={maxLength}
        value={value}
        className={`field-ring h-40 w-full resize-none overflow-y-auto rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-sm text-coffee-text outline-none transition placeholder:text-coffee-muted/50 focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/25 ${
          error ? "border-red-400/70" : "border-coffee-border"
        }`}
        {...props}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-coffee-muted">{hint || ""}</span>
        {showCount && maxLength ? (
          <span className="text-xs text-coffee-muted">
            {value.length} / {maxLength}
          </span>
        ) : null}
      </div>
      {error ? (
        <span className="mt-2 block text-xs text-red-300">{error}</span>
      ) : null}
    </label>
  );
}

export default FormTextarea;
