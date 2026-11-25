import type { GuideHref } from "./guide-catalog";

/** Homepage “What the scan looks for” links. Every guide href appears at least once. */
export const scanTopics: { label: string; href: GuideHref }[] = [
  { label: "White, near-white, and low-contrast text", href: "/detect-white-text-in-pdf" },
  { label: "Transparent text and PDF invisible rendering", href: "/detect-white-text-in-pdf" },
  { label: "Tiny fonts, under about 2 pt", href: "/detect-white-text-in-pdf" },
  { label: "Text placed off the page or covered by a shape", href: "/trojan-horse-prompt-homework" },
  { label: "Word vanish, web-hidden, and spec-vanish formatting", href: "/detect-hidden-text-in-word" },
  { label: "Zero-width characters and bidi overrides", href: "/invisible-character-detector" },
  { label: "Cyrillic or Greek letters swapped into Latin words", href: "/invisible-character-detector" },
  { label: "Prompt-injection phrases, including in text you can see", href: "/check-assignment-for-hidden-ai-prompt" },
  { label: "Comments, metadata, image alt text, and form fields", href: "/detect-hidden-text-in-word" },
  { label: "Deleted text still stored in tracked changes", href: "/detect-hidden-text-in-word" },
  { label: "Hidden text in a downloaded Canvas assignment", href: "/canvas-assignment-hidden-text" },
  { label: "Hidden prompts or keyword blocks in a résumé", href: "/check-resume-for-hidden-ai-prompt" },
  { label: "Whether a hidden résumé prompt actually works", href: "/does-resume-prompt-injection-work" },
  { label: "White-font keyword stuffing on a résumé", href: "/white-text-in-resume" },
  { label: "Hidden text and what Turnitin documents publicly", href: "/turnitin-hidden-text" },
];
