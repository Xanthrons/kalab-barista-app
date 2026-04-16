function StepIndicator({ currentStep, totalSteps, titles }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-coffee-muted/80">
        <span>Application Progress</span>
        <span>
          {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#d4a373,#edc08a)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {titles.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isComplete = currentStep > stepNumber;

          return (
            <div
              key={title}
              className={`rounded-[24px] border px-3 py-3 text-center transition ${
                isActive
                  ? "border-coffee-accent bg-coffee-accent/14 text-coffee-text shadow-soft"
                  : isComplete
                    ? "border-coffee-accent/50 bg-coffee-accent/8 text-coffee-text/90"
                    : "border-coffee-border bg-white/[0.03] text-coffee-muted"
              }`}
            >
              <div className="text-sm font-semibold">{stepNumber}</div>
              <div className="mt-1 text-[10px] tracking-[0.22em]">{title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
