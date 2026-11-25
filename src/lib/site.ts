export const site = {
  name: "CheckForMe",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://checkforme.local").replace(/\/$/, ""),
  title: "CheckForMe – Scan your assignment for hidden AI traps",
  description:
    "Find white text, tiny fonts, invisible characters, and prompt injections hidden in homework files. PDF and DOCX scans run in your browser — files never leave your device.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};

export const landingPages = [
  {
    href: "/check-assignment-for-hidden-ai-prompt",
    label: "Hidden AI prompts",
  },
  {
    href: "/detect-white-text-in-pdf",
    label: "White text in PDFs",
  },
  {
    href: "/trojan-horse-prompt-homework",
    label: "Trojan horse prompts",
  },
] as const;
