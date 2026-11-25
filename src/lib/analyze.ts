import { blendOver, contrastRatio, formatRgb, isNearWhite, WHITE } from "./color";
import { findInjections, stripHighInjections } from "./injection";
import type {
  ExtractedDocument,
  Finding,
  FindingType,
  ScanResult,
  Severity,
  TextRun,
  TranscriptSegment,
  Verdict,
} from "./types";
import { findHomoglyphs, findInvisible, stripInvisible, visualizeInvisible } from "./unicode";

/** Concealment that means a trap was planted, even without an AI-addressed phrase. */
const TRAP_TYPES = new Set<FindingType>([
  "white-text",
  "low-contrast",
  "tiny-font",
  "transparent",
  "invisible-render",
  "off-page",
  "covered",
  "hidden-formatting",
  "zero-width",
  "bidi",
  "tracked-change",
]);

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

type Assessment = {
  concealed: boolean;
  findings: Finding[];
  injectionRanges: Array<{ start: number; end: number }>;
};

function snippet(text: string, max = 280): string {
  const shown = visualizeInvisible(text).replace(/\s+/g, " ").trim();
  if (shown.length <= max) return shown;
  return `${shown.slice(0, max - 1)}…`;
}

function makeFinding(
  partial: Omit<Finding, "id"> & { id?: string },
  index: number,
): Finding {
  return {
    id: partial.id ?? `${partial.type}-${index}`,
    type: partial.type,
    severity: partial.severity,
    title: partial.title,
    description: partial.description,
    text: partial.text,
    location: partial.location,
    page: partial.page,
  };
}

function assessRun(run: TextRun): Assessment {
  const findings: Array<Omit<Finding, "id">> = [];
  let concealed = false;
  const text = run.text ?? "";
  const hasWords = stripInvisible(text).trim().length > 0;
  const background = run.background ?? WHITE;

  if (run.hiddenFormatting && hasWords) {
    concealed = true;
    findings.push({
      type: "hidden-formatting",
      severity: "high",
      title: "Text marked hidden in Word",
      description: `This run uses Word's ${run.hiddenFormatting} formatting, so it does not show on the page but is still stored in the file.`,
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  const renderMode = run.renderMode ?? 0;
  if ((renderMode === 3 || renderMode === 7) && hasWords) {
    concealed = true;
    findings.push({
      type: "invisible-render",
      severity: "high",
      title: "Text with invisible PDF rendering",
      description:
        "The PDF draws this text in rendering mode 3 or 7, which adds the characters without painting them.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  const opacity = run.opacity ?? 1;
  if (run.color && opacity <= 0.04 && hasWords) {
    concealed = true;
    findings.push({
      type: "transparent",
      severity: "high",
      title: "Transparent text",
      description: "This text is drawn with nearly zero opacity, so it disappears against the page.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  } else if (run.color && hasWords && renderMode !== 3 && renderMode !== 7 && opacity > 0.04) {
    const painted = blendOver(run.color, background, opacity);
    const ratio = contrastRatio(painted, background);
    if (ratio < 1.2 && isNearWhite(painted) && isNearWhite(background)) {
      concealed = true;
      findings.push({
        type: "white-text",
        severity: "high",
        title: "White or near-white text",
        description: `The text color is ${formatRgb(painted)} on a ${formatRgb(background)} background, so it blends into the page.`,
        text: snippet(text),
        location: run.location,
        page: run.page,
      });
    } else if (ratio < 1.5) {
      concealed = true;
      findings.push({
        type: "low-contrast",
        severity: "high",
        title: "Text that blends into the background",
        description: `Contrast against the background is ${ratio.toFixed(2)}:1 (${formatRgb(painted)} on ${formatRgb(background)}). That is effectively invisible.`,
        text: snippet(text),
        location: run.location,
        page: run.page,
      });
    } else if (ratio < 2) {
      findings.push({
        type: "low-contrast",
        severity: "medium",
        title: "Very low contrast text",
        description: `Contrast against the background is only ${ratio.toFixed(2)}:1 (${formatRgb(painted)} on ${formatRgb(background)}).`,
        text: snippet(text),
        location: run.location,
        page: run.page,
      });
    }
  }

  if (run.fontSizePt != null && hasWords) {
    if (run.fontSizePt < 2.25) {
      concealed = true;
      findings.push({
        type: "tiny-font",
        severity: "high",
        title: "Tiny font",
        description: `This text is ${run.fontSizePt.toFixed(2)} pt. Anything under about 2 pt is a common way to hide a line from a quick read.`,
        text: snippet(text),
        location: run.location,
        page: run.page,
      });
    } else if (run.fontSizePt < 4) {
      findings.push({
        type: "small-font",
        severity: "medium",
        title: "Very small font",
        description: `This text is ${run.fontSizePt.toFixed(2)} pt, small enough to miss at normal zoom.`,
        text: snippet(text),
        location: run.location,
        page: run.page,
      });
    }
  }

  if (run.offPage && hasWords) {
    concealed = true;
    findings.push({
      type: "off-page",
      severity: "high",
      title: "Text positioned off the page",
      description: "The text sits outside the page box, so it is not visible when the page is read or printed.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (run.coverKind === "shape" && hasWords) {
    concealed = true;
    findings.push({
      type: "covered",
      severity: "high",
      title: "Text hidden behind a shape or image",
      description: "Something opaque is painted on top of this text later in the file.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  } else if (run.coverKind === "behind" && hasWords) {
    findings.push({
      type: "covered",
      severity: "low",
      title: "Text box placed behind the page",
      description:
        "Word marked this text box as behind the document. Watermarks use the same flag, so read the text before treating it as a trap.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  const invisible = findInvisible(text);
  const bidi = invisible.filter((hit) => hit.kind === "bidi");
  const zeroWidth = invisible.filter((hit) => hit.kind === "zero-width" && hit.code !== 0x00ad);
  const softHyphens = invisible.filter((hit) => hit.code === 0x00ad);

  if (bidi.length > 0) {
    findings.push({
      type: "bidi",
      severity: "high",
      title: "Bidirectional override characters",
      description:
        "Unicode direction overrides can display one word while an AI reads a different sequence.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (zeroWidth.length > 0 || softHyphens.length >= 3) {
    const inside = zeroWidth.some((hit) => hit.insideWord);
    findings.push({
      type: "zero-width",
      severity: inside || zeroWidth.length >= 3 ? "high" : "medium",
      title: "Invisible Unicode characters",
      description: inside
        ? "Zero-width characters are sitting inside a word, so the text you see and the text an AI reads can differ."
        : "Invisible Unicode characters are mixed into this text. They copy along with the words.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  const homoglyphs = findHomoglyphs(text);
  if (homoglyphs.length > 0) {
    const sample = homoglyphs
      .slice(0, 3)
      .map((hit) => hit.word)
      .join(", ");
    findings.push({
      type: "homoglyph",
      severity: homoglyphs.length >= 3 ? "medium" : "low",
      title: "Lookalike letters mixed into a word",
      description: `These words mix Latin letters with Cyrillic or Greek lookalikes: ${sample}.`,
      text: snippet(homoglyphs.map((hit) => hit.word).join(" ")),
      location: run.location,
      page: run.page,
    });
  }

  const injections = findInjections(text);
  for (const injection of injections) {
    findings.push({
      type: "prompt-injection",
      severity: injection.severity,
      title: "Prompt-injection phrasing",
      description: injection.label + ".",
      text: snippet(injection.snippet),
      location: run.location,
      page: run.page,
    });
  }

  if (run.source === "annotation" && hasWords) {
    findings.push({
      type: "comment",
      severity: injections.some((item) => item.severity === "high") ? "high" : "low",
      title: "Note stored in the PDF",
      description: "PDF annotations stay in the file even when they are easy to miss on the page.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (run.source === "comment" && hasWords) {
    findings.push({
      type: "comment",
      severity: injections.some((item) => item.severity === "high") ? "high" : "low",
      title: "Comment stored in the file",
      description:
        "Comments are easy to miss on the page, but many AI tools read them when the file itself is uploaded.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (run.source === "metadata" && (injections.length > 0 || invisible.length > 0)) {
    findings.push({
      type: "metadata",
      severity: injections.some((item) => item.severity === "high") ? "high" : "medium",
      title: "Instructions hidden in document metadata",
      description: "This text is in the file properties, not on the page.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (run.source === "alt" && (injections.length > 0 || invisible.length > 0 || text.trim().length > 180)) {
    findings.push({
      type: "alt-text",
      severity: injections.some((item) => item.severity === "high") ? "high" : "medium",
      title: "Suspicious image alt text",
      description: "Alt text is not printed on the page, but it is part of the file an AI can read.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (run.source === "form" && hasWords) {
    findings.push({
      type: "form-field",
      severity: injections.some((item) => item.severity === "high") ? "high" : "medium",
      title: "Text stored in a form field",
      description: "Form-field defaults and tags are not always visible, but they remain inside the DOCX.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (run.source === "deleted" && hasWords) {
    concealed = true;
    findings.push({
      type: "tracked-change",
      severity: injections.length > 0 ? "high" : "medium",
      title: "Deleted text still stored in the file",
      description: "Track-changes deletions stay in the DOCX even when they are hidden on screen.",
      text: snippet(text),
      location: run.location,
      page: run.page,
    });
  }

  if (
    run.source === "comment" ||
    run.source === "metadata" ||
    run.source === "alt" ||
    run.source === "form" ||
    run.source === "annotation" ||
    run.source === "deleted"
  ) {
    concealed = true;
  }

  return {
    concealed,
    findings: findings.map((finding, index) => makeFinding(finding, index)),
    injectionRanges: injections
      .filter((item) => item.severity === "high")
      .map((item) => ({ start: item.start, end: item.end })),
  };
}

/** How a run should be rewritten when building a cleaned file. */
export function planRunCleanup(run: TextRun): { action: "keep" | "drop" | "rewrite"; text: string } {
  const assessment = assessRun(run);
  if (run.source === "metadata" || run.source === "alt") {
    return assessment.findings.length > 0 ? { action: "drop", text: "" } : { action: "keep", text: run.text };
  }
  if (
    run.source === "comment" ||
    run.source === "form" ||
    run.source === "annotation" ||
    run.source === "deleted"
  ) {
    return { action: "drop", text: "" };
  }
  if (assessment.concealed) return { action: "drop", text: "" };
  const rewritten = stripHighInjections(stripInvisible(run.text)).trim();
  if (!rewritten) return { action: "drop", text: "" };
  if (rewritten !== run.text) return { action: "rewrite", text: rewritten };
  return { action: "keep", text: run.text };
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const unique: Finding[] = [];
  for (const finding of findings) {
    const key = `${finding.type}|${finding.location}|${finding.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(finding);
  }
  unique.sort((a, b) => {
    const severity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (severity !== 0) return severity;
    return a.location.localeCompare(b.location);
  });
  return unique.map((finding, index) => ({ ...finding, id: `${finding.type}-${index + 1}` }));
}

export function decideVerdict(findings: Finding[]): Verdict {
  if (findings.length === 0) return "clean";
  const trap = findings.some(
    (finding) => finding.severity === "high" || (finding.severity === "medium" && TRAP_TYPES.has(finding.type)),
  );
  return trap ? "traps_found" : "suspicious";
}

function verdictCopy(verdict: Verdict, count: number): { title: string; detail: string } {
  if (verdict === "clean") {
    return {
      title: "Clean",
      detail: "No hidden text, invisible characters, or prompt-injection phrasing turned up in this scan.",
    };
  }
  if (verdict === "traps_found") {
    return {
      title: "Traps found",
      detail:
        count === 1
          ? "One finding looks like a hidden trap an AI could read even when it is hard to see on the page."
          : `${count} findings look like hidden traps an AI could read even when they are hard to see on the page.`,
    };
  }
  return {
    title: "Suspicious",
    detail:
      count === 1
        ? "One signal is worth a look. It is not fully concealed text, but it should not be ignored."
        : `${count} signals are worth a look. None is fully concealed text, but they should not be ignored.`,
  };
}

const TRANSCRIPT_SOURCES = new Set([
  "body",
  "header",
  "footer",
  "footnote",
  "endnote",
  "textbox",
  "deleted",
]);

function pushSegment(segments: TranscriptSegment[], kind: TranscriptSegment["kind"], text: string) {
  if (!text) return;
  const previous = segments[segments.length - 1];
  if (previous && previous.kind === kind) {
    previous.text += text;
    return;
  }
  segments.push({ text, kind });
}

function segmentsFromRun(run: TextRun, assessment: Assessment): TranscriptSegment[] {
  if (!TRANSCRIPT_SOURCES.has(run.source)) return [];
  const text = run.text;
  if (!text) return [];
  if (assessment.concealed) {
    if (!text.trim() && findInvisible(text).length === 0) return [];
    return [{ text, kind: "hidden" }];
  }
  if (assessment.injectionRanges.length === 0) {
    return [{ text, kind: "plain" }];
  }
  const ranges = [...assessment.injectionRanges].sort((a, b) => a.start - b.start);
  const parts: TranscriptSegment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    const start = Math.max(range.start, cursor);
    const end = Math.min(range.end, text.length);
    if (end <= start) continue;
    if (start > cursor) parts.push({ text: text.slice(cursor, start), kind: "plain" });
    parts.push({ text: text.slice(start, end), kind: "injection" });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), kind: "plain" });
  return parts;
}

function joinClean(runs: Array<{ run: TextRun; assessment: Assessment }>): string {
  let clean = "";
  for (const { run, assessment } of runs) {
    if (assessment.concealed) continue;
    if (!TRANSCRIPT_SOURCES.has(run.source)) continue;
    const piece = stripHighInjections(stripInvisible(run.text)).trim();
    if (!piece) continue;
    if (!clean) {
      clean = piece;
      continue;
    }
    const spacer = run.spacerBefore === "\n" || run.blockId == null ? "\n" : run.spacerBefore || " ";
    if (spacer === "\n") {
      clean += `\n${piece}`;
    } else if (clean.endsWith(" ") || clean.endsWith("\n") || piece.startsWith(" ")) {
      clean += piece;
    } else if (spacer === " ") {
      clean += ` ${piece}`;
    } else {
      clean += piece;
    }
  }
  return clean.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function analyzeDocument(doc: ExtractedDocument): ScanResult {
  const assessed = doc.runs.map((run) => ({ run, assessment: assessRun(run) }));
  const findings = dedupeFindings(assessed.flatMap((item) => item.assessment.findings));
  const verdict = decideVerdict(findings);
  const copy = verdictCopy(verdict, findings.length);

  const segments: TranscriptSegment[] = [];
  let lastBlock: string | undefined;
  assessed.forEach(({ run, assessment }, index) => {
    const parts = segmentsFromRun(run, assessment);
    if (parts.length === 0) return;
    if (segments.length > 0) {
      const spacer =
        run.spacerBefore ??
        (run.blockId && run.blockId === lastBlock ? " " : index === 0 ? "" : "\n");
      if (spacer) pushSegment(segments, "plain", spacer);
    }
    for (const part of parts) pushSegment(segments, part.kind, part.text);
    lastBlock = run.blockId;
  });

  return {
    verdict,
    verdictTitle: copy.title,
    verdictDetail: copy.detail,
    findings,
    cleanText: joinClean(assessed),
    segments,
    fileName: doc.fileName,
    fileType: doc.fileType,
    pageCount: doc.pageCount,
  };
}
