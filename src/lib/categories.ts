import type { Finding, FindingType, Severity } from "./types";

export type CategoryId =
  | "hidden-text"
  | "tiny"
  | "injection"
  | "invisible"
  | "comments"
  | "metadata";

export type CategoryDefinition = {
  id: CategoryId;
  label: string;
  types: FindingType[];
};

/** Every results page lists these six, even when a category is clean. */
export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "hidden-text",
    label: "White & hidden text",
    types: [
      "white-text",
      "low-contrast",
      "transparent",
      "invisible-render",
      "off-page",
      "covered",
      "hidden-formatting",
      "tracked-change",
    ],
  },
  {
    id: "tiny",
    label: "Tiny fonts",
    types: ["tiny-font", "small-font"],
  },
  {
    id: "injection",
    label: "Prompt injections",
    types: ["prompt-injection"],
  },
  {
    id: "invisible",
    label: "Invisible characters",
    types: ["zero-width", "bidi", "homoglyph"],
  },
  {
    id: "comments",
    label: "Hidden comments",
    types: ["comment", "alt-text", "form-field"],
  },
  {
    id: "metadata",
    label: "Metadata",
    types: ["metadata"],
  },
];

export type CategoryGroup = {
  id: CategoryId;
  label: string;
  findings: Finding[];
};

const SEVERITY_PENALTY: Record<Severity, number> = { high: 22, medium: 12, low: 6 };

export function groupFindings(findings: Finding[]): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    findings: findings.filter((finding) => category.types.includes(finding.type)),
  }));
}

/** 100 is clean. Each finding pulls the score down by severity. */
export function safetyScore(findings: Finding[]): number {
  const penalty = findings.reduce((sum, finding) => sum + SEVERITY_PENALTY[finding.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function scoreTone(score: number): "good" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 50) return "warn";
  return "bad";
}
