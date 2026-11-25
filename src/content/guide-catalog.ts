export const guideCatalog = [
  {
    href: "/check-assignment-for-hidden-ai-prompt",
    label: "Hidden AI prompts",
    summary: "Phrases aimed at a model, whether you can see them or not.",
  },
  {
    href: "/detect-white-text-in-pdf",
    label: "White text in PDFs",
    summary: "White ink, tiny type, transparency, and text that is not painted.",
  },
  {
    href: "/trojan-horse-prompt-homework",
    label: "Trojan horse prompts",
    summary: "A second instruction that rides along inside a homework file.",
  },
  {
    href: "/canvas-assignment-hidden-text",
    label: "Canvas assignment files",
    summary: "What survives when you download a Canvas assignment as PDF or DOCX.",
  },
  {
    href: "/detect-hidden-text-in-word",
    label: "Hidden text in Word",
    summary: "Comments, vanish formatting, tracked changes, and document properties.",
  },
  {
    href: "/invisible-character-detector",
    label: "Invisible characters",
    summary: "Zero-width characters, bidi overrides, and lookalike letters.",
  },
  {
    href: "/check-resume-for-hidden-ai-prompt",
    label: "Hidden prompts in a resume",
    summary: "White keywords and model instructions inside a résumé file.",
  },
] as const;

export type GuideHref = (typeof guideCatalog)[number]["href"];
