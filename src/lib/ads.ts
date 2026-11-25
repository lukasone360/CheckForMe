/** AdSense stays off until a client id is configured. Slots render nothing before that. */
export function adsenseClient(): string | undefined {
  const value = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
