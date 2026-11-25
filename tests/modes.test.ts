import { describe, expect, it } from "vitest";
import { groupFindings } from "@/lib/categories";
import { getMode } from "@/lib/modes";
import type { Finding } from "@/lib/types";

const finding = (type: Finding["type"]): Finding => ({
  id: type,
  type,
  severity: "high",
  title: type,
  description: type,
  text: type,
  location: type,
});

describe("scan modes", () => {
  it("keeps homework copy and points each mode at its own URL", () => {
    const homework = getMode("homework");
    expect(homework.href).toBe("/");
    expect(homework.headline).toBe("Check your assignment for hidden AI traps");
    expect(homework.helper).toEqual([
      "White text, tiny fonts, prompt injections — found in seconds.",
      "Files never leave your device.",
    ]);
    expect(homework.pasteLabel).toBe("Or paste assignment text");
    expect(homework.verdicts.clean).toBe("Looks clean, safe to paste");
    expect(homework.verdicts.suspicious).toBe("Suspicious: review these signals before you paste");
    expect(homework.verdicts.traps_found).toBe("Hidden instructions found in this assignment");
    expect(getMode("resume").href).toBe("/resume-checker");
    expect(getMode("resume").verdicts.traps_found).toBe("Hidden instructions found in this résumé");
    expect(getMode("document").href).toBe("/document-checker");
    expect(getMode("document").verdicts.traps_found).toBe("Hidden instructions found in this document");
  });

  it("reorders findings without requiring another scan", () => {
    const findings = [
      finding("metadata"),
      finding("comment"),
      finding("white-text"),
      finding("prompt-injection"),
      finding("tiny-font"),
    ];
    expect(groupFindings(findings).map((group) => group.id)).toEqual([
      "hidden-text",
      "tiny",
      "injection",
      "invisible",
      "comments",
      "metadata",
    ]);
    expect(groupFindings(findings, getMode("resume").categoryOrder).map((group) => group.id).slice(0, 3)).toEqual([
      "injection",
      "hidden-text",
      "tiny",
    ]);
    expect(groupFindings(findings, getMode("document").categoryOrder).map((group) => group.id).slice(0, 2)).toEqual([
      "metadata",
      "comments",
    ]);
  });
});
