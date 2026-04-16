function FormInput({
  id,
  label,
  error,
  className = "",
  hint,
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-coffee-text">{label}</span>
      <input
        id={id}
        className={`field-ring w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-sm text-coffee-text outline-none transition placeholder:text-coffee-muted/50 focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/25 ${
          error ? "border-red-400/70" : "border-coffee-border"
        }`}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs text-coffee-muted">{hint}</span> : null}
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

export default FormInput;
