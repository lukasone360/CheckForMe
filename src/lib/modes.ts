import type { CategoryId } from "./categories";
import { site } from "./site";
import type { Verdict } from "./types";

export type ScanModeId = "homework" | "resume" | "document";

export type ScanMode = {
  id: ScanModeId;
  href: "/" | "/resume-checker" | "/document-checker";
  switchLabel: string;
  crumb: string;
  /** Document <title> text. Homework uses the historical absolute title. */
  title: string;
  description: string;
  headline: string;
  helper: readonly [string, string];
  pasteLabel: string;
  pastePlaceholder: string;
  verdicts: Record<Verdict, string>;
  /** Category ids, first = emphasized. */
  categoryOrder: readonly CategoryId[];
  /** Shown above the checklist when this mode reorders findings. */
  emphasisNote: string | null;
};

const HOMEWORK_ORDER = [
  "hidden-text",
  "tiny",
  "injection",
  "invisible",
  "comments",
  "metadata",
] as const satisfies readonly CategoryId[];

/** White text, tiny type, and prompt injection lead. */
const RESUME_ORDER = [
  "injection",
  "hidden-text",
  "tiny",
  "invisible",
  "comments",
  "metadata",
] as const satisfies readonly CategoryId[];

/** Metadata and comments lead. */
const DOCUMENT_ORDER = [
  "metadata",
  "comments",
  "hidden-text",
  "tiny",
  "injection",
  "invisible",
] as const satisfies readonly CategoryId[];

export const SCAN_MODES: readonly ScanMode[] = [
  {
    id: "homework",
    href: "/",
    switchLabel: "Homework",
    crumb: "Home",
    title: site.title,
    description: site.description,
    headline: "Check your assignment for hidden AI traps",
    helper: [
      "White text, tiny fonts, prompt injections — found in seconds.",
      "Files never leave your device.",
    ],
    pasteLabel: "Or paste assignment text",
    pastePlaceholder: "Paste a question, or the paragraph that looks a little too clean.",
    verdicts: {
      clean: "Looks clean, safe to paste",
      suspicious: "Suspicious: review these signals before you paste",
      traps_found: "Hidden instructions found in this assignment",
    },
    categoryOrder: HOMEWORK_ORDER,
    emphasisNote: null,
  },
  {
    id: "resume",
    href: "/resume-checker",
    switchLabel: "Résumé / HR",
    crumb: "Résumé checker",
    title: "Check a résumé for hidden AI instructions",
    description:
      "Scan a résumé PDF or DOCX for white text, tiny fonts, and hidden prompt injections. The résumé checker runs in your browser and the file is not uploaded.",
    headline: "Check a résumé for hidden AI instructions",
    helper: [
      "White text, tiny fonts, and prompt injection — checked first.",
      "Files never leave your device.",
    ],
    pasteLabel: "Or paste résumé text",
    pastePlaceholder: "Paste a bullet, a summary, or the line that looks out of place.",
    verdicts: {
      clean: "No hidden instructions found in this résumé",
      suspicious: "Review these signals in this résumé before you send it",
      traps_found: "Hidden instructions found in this résumé",
    },
    categoryOrder: RESUME_ORDER,
    emphasisNote: "Résumé checks emphasize prompt injection, white text, and tiny fonts. Those groups are listed first.",
  },
  {
    id: "document",
    href: "/document-checker",
    switchLabel: "Any document",
    crumb: "Document checker",
    title: "Check any document for hidden text and prompts",
    description:
      "Scan a PDF, DOCX, or paste for metadata, comments, white text, and prompt injections. Document mode lists properties and comments first. The file stays on your device.",
    headline: "Check any document for hidden text and prompts",
    helper: [
      "Metadata, comments, and concealed text — properties listed first.",
      "Files never leave your device.",
    ],
    pasteLabel: "Or paste document text",
    pastePlaceholder: "Paste a paragraph, a property, or text copied from the file.",
    verdicts: {
      clean: "No hidden instructions found in this document",
      suspicious: "Review these signals in this document",
      traps_found: "Hidden instructions found in this document",
    },
    categoryOrder: DOCUMENT_ORDER,
    emphasisNote: "Document checks raise metadata and comments. Those groups are listed first.",
  },
];

export function getMode(id: ScanModeId): ScanMode {
  const mode = SCAN_MODES.find((item) => item.id === id);
  if (!mode) throw new Error(`Unknown scan mode: ${id}`);
  return mode;
}
