/** AdSense stays off until a client id is configured. Slots render nothing before that. */
export function adsenseClient(): string | undefined {
  const value = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export type AdPlacement = "results" | "guide";

/**
 * Numeric AdSense slot id for a placement.
 * Returns undefined when the env var is missing or not a plain integer.
 */
export function adsenseSlot(placement: AdPlacement): string | undefined {
  const raw =
    placement === "results"
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS
      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE;
  const trimmed = raw?.trim() ?? "";
  return /^\d+$/.test(trimmed) ? trimmed : undefined;
}

/**
 * ads.txt line for a publisher id. Accepts `ca-pub-…` or `pub-…`.
 * Returns undefined when no client id is configured.
 */
export function adsTxtBody(client: string | undefined): string | undefined {
  if (!client) return undefined;
  const publisher = client.trim().replace(/^ca-/, "");
  if (!publisher) return undefined;
  return `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
}
