function AppBackdrop({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-coffee-bg text-coffee-text">
      <div className="coffee-noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-[-12rem] h-[32rem] bg-[radial-gradient(circle_at_top,rgba(212,163,115,0.2),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-16rem] h-[30rem] bg-[radial-gradient(circle_at_bottom,rgba(112,63,33,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-coffee-texture opacity-25" />
      <span className="bean left-[8%] top-[10%] h-14 w-9 opacity-60" />
      <span className="bean right-[11%] top-[18%] h-10 w-6 opacity-40" />
      <span className="bean bottom-[18%] left-[10%] h-12 w-7 opacity-35" />
      <span className="bean bottom-[14%] right-[12%] h-16 w-10 opacity-45" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AppBackdrop;
