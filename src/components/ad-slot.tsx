"use client";

import { useEffect } from "react";
import { adsenseClient, adsenseSlot, type AdPlacement } from "@/lib/ads";

type AdSlotProps = {
  placement: AdPlacement;
  className?: string;
};

/**
 * AdSense unit for one placement.
 * Renders nothing unless NEXT_PUBLIC_ADSENSE_CLIENT and a numeric slot id are both set.
 */
export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const client = adsenseClient();
  const slot = adsenseSlot(placement);

  useEffect(() => {
    if (!client || !slot) return;
    const ads = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = ads;
    try {
      ads.push({});
    } catch {
      // The ad script can reject a push when a slot is already filled.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  const spacing = placement === "results" ? "mt-20" : "mt-16";

  return (
    <aside
      className={`mx-auto w-full max-w-3xl ${spacing} ${className}`}
      data-ad-slot={slot}
      aria-label="Advertisement"
    >
      <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
