"use client";

import { useEffect, useState } from "react";
import { MIN_SCAN_MS, SCAN_STEPS } from "@/lib/scan-steps";

export function ScanningScreen({ fileName, startedAt }: { fileName: string; startedAt: number }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setStep(0);
    const interval = window.setInterval(() => {
      setStep((current) => (current + 1) % SCAN_STEPS.length);
    }, reduced ? 2500 : 1400);
    return () => window.clearInterval(interval);
  }, [reduced, startedAt]);

  useEffect(() => {
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(1, elapsed / MIN_SCAN_MS));
    };
    tick();
    if (reduced) {
      const interval = window.setInterval(tick, 2000);
      return () => window.clearInterval(interval);
    }
    let frame = 0;
    const loop = () => {
      tick();
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [reduced, startedAt]);

  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

  return (
    <div id="scanning" className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center" role="status" aria-live="polite">
      <div className="relative h-56 w-56">
        <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#e7edf4" strokeWidth="14" />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#12263f"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className={reduced ? undefined : "transition-[stroke-dasharray] duration-200"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-extrabold tabular-nums text-navy">{Math.round(progress * 100)}</span>
        </div>
      </div>
      <p key={step} className="scan-step mt-10 text-xl font-semibold text-navy">
        {SCAN_STEPS[step]}
      </p>
      <p className="mt-2 text-sm text-muted">{fileName}</p>
    </div>
  );
}
