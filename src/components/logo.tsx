export function ShieldMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="#1fbf5b"
        d="M16 2.2 5.2 6.7v8.7c0 6.5 4.3 11.6 10.8 13.5 6.5-1.9 10.8-7 10.8-13.5V6.7L16 2.2z"
      />
      <path
        d="M10.4 16.1 14.1 19.9 21.7 11.6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <ShieldMark className={compact ? "h-7 w-7" : "h-8 w-8"} />
      <span className={`font-extrabold tracking-tight ${compact ? "text-lg" : "text-xl"}`}>
        <span className="text-navy">Check</span>
        <span className="text-green-dark">ForMe</span>
      </span>
    </span>
  );
}
