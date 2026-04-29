function ProgramCard({ title, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-[26px] border p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99] ${
        active
          ? "border-coffee-accent bg-[linear-gradient(180deg,rgba(212,163,115,0.18),rgba(212,163,115,0.06))] shadow-soft"
          : "border-coffee-border bg-white/[0.03] hover:border-coffee-accent/60 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-coffee-text">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-coffee-muted">
            {description}
          </p>
        </div>
        <span
          className={`h-4 w-4 rounded-full border ${
            active
              ? "border-coffee-accent bg-coffee-accent"
              : "border-coffee-muted/50"
          }`}
        />
      </div>
    </button>
  );
}

export default ProgramCard;
