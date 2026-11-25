const DEFAULT_SITE_URL = "https://checkforme.vercel.app";

/** Bump when public pages or legal copy change. Sitemap and legal pages read this. */
export const CONTENT_UPDATED = "2026-11-25";

/** Shown when NEXT_PUBLIC_CONTACT_EMAIL is unset. Not a real inbox. */
export const CONTACT_EMAIL_PLACEHOLDER = "hello@[our-domain]";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw && raw.length > 0 ? raw : DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function contactEmail(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

export function contactEmailLabel(): string {
  return contactEmail() ?? CONTACT_EMAIL_PLACEHOLDER;
}

export function contentUpdatedLabel(): string {
  const [year, month, day] = CONTENT_UPDATED.split("-").map((part) => Number(part));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export const site = {
  name: "CheckForMe",
  get url() {
    return siteUrl();
  },
  title: "CheckForMe – Scan your assignment for hidden AI traps",
  description:
    "Find white text, tiny fonts, invisible characters, and prompt injections hidden in homework files. PDF and DOCX scans run in your browser — files never leave your device.",
  get contactEmail() {
    return contactEmail() ?? "";
  },
};
