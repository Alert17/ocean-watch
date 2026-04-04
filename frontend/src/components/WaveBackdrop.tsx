/** Silhouettes de vagues / strates d’eau — inspiration carnet de plongée. */
export function WaveBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden opacity-[0.35]"
      aria-hidden
    >
      <svg
        className="absolute -top-8 w-[200%] min-w-[800px] text-lagoon-500/30"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 60 C200 20 400 100 600 55 S1000 15 1200 60 V120 H0 Z"
        />
      </svg>
      <svg
        className="absolute top-4 w-[200%] min-w-[800px] text-reef-400/20"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 75 C250 40 450 95 700 70 S1050 35 1200 75 V120 H0 Z"
        />
      </svg>
    </div>
  );
}
