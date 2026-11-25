"use client";

import { useEffect } from "react";
import { adsenseClient } from "@/lib/ads";

type AdSlotProps = {
  slot: string;
  className?: string;
};

/**
 * Placeholder for a future AdSense unit.
 * Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT is set at build time.
 */
export function AdSlot({ slot, className = "" }: AdSlotProps) {
  const client = adsenseClient();

  useEffect(() => {
    if (!client) return;
    const ads = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = ads;
    try {
      ads.push({});
    } catch {
      // The ad script can reject a push when a slot is already filled.
    }
  }, [client]);

  if (!client) return null;

  return (
    <aside
      className={`mx-auto my-8 w-full max-w-3xl ${className}`}
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
