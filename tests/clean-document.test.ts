import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { groupFindings, safetyScore } from "@/lib/categories";
import { buildCleanDocx, buildCleanPdf, buildCleanText, buildReportHtml } from "@/lib/clean-document";
import { MIN_SCAN_MS, SCAN_STEPS, remainingScanDelay } from "@/lib/scan-steps";
import { scanBytes, scanText } from "@/lib/scan";

async function readSample(name: string) {
  return new Uint8Array(await readFile(new URL(`../samples/${name}`, import.meta.url)));
}

describe("scan pacing", () => {
  it("holds the scanning screen for at least 10 seconds", () => {
    expect(MIN_SCAN_MS).toBeGreaterThanOrEqual(10_000);
    expect(remainingScanDelay(0)).toBe(10_000);
    expect(remainingScanDelay(4_000)).toBe(6_000);
    expect(remainingScanDelay(12_000)).toBe(0);
    expect(SCAN_STEPS).toEqual([
      "Reading your document…",
      "Looking for white text…",
      "Checking for tiny fonts…",
      "Looking for prompt injections…",
      "Scanning invisible characters…",
      "Inspecting comments and metadata…",
      "Double-checking results…",
    ]);
  });
});

describe("categories and score", () => {
  it("always lists the six checklist categories", () => {
    const groups = groupFindings([]);
    expect(groups.map((group) => group.label)).toEqual([
      "White & hidden text",
      "Tiny fonts",
      "Prompt injections",
      "Invisible characters",
      "Hidden comments",
      "Metadata",
    ]);
    expect(safetyScore([])).toBe(100);
  });
});

describe("clean documents", () => {
  it("writes a cleaned PDF that keeps the assignment and drops white text", async () => {
    const original = await readSample("pdf-white-text.pdf");
    const scanned = await scanBytes(original, "pdf-white-text.pdf");
    expect(scanned.verdict).toBe("traps_found");

    const cleaned = await buildCleanPdf(scanned.cleanText, "pdf-white-text.pdf");
    expect(cleaned.fileName).toBe("pdf-white-text.clean.pdf");
    expect(cleaned.mimeType).toBe("application/pdf");

    const again = await scanBytes(cleaned.bytes, cleaned.fileName);
    expect(again.verdict).toBe("clean");
    expect(again.cleanText.toLowerCase()).toContain("photosynthesis");
    expect(again.cleanText.toLowerCase()).not.toContain("white on a white");
  });

  it("writes a cleaned DOCX with the white run removed and the question kept", async () => {
    const original = await readSample("docx-white-text.docx");
    const scanned = await scanBytes(original, "docx-white-text.docx");
    const cleaned = await buildCleanDocx(original, "docx-white-text.docx");
    expect(cleaned.fileName).toBe("docx-white-text.clean.docx");

    const again = await scanBytes(cleaned.bytes, cleaned.fileName);
    expect(again.verdict, JSON.stringify(again.findings, null, 2)).toBe("clean");
    expect(again.cleanText.toLowerCase()).toContain("photosynthesis");
    expect(again.cleanText.toLowerCase()).not.toContain("white on a white");
    expect(scanned.cleanText.toLowerCase()).toContain("photosynthesis");
  });

  it("strips a comment trap and poisoned metadata out of a DOCX", async () => {
    const commentFile = await readSample("docx-comment.docx");
    const cleanedComment = await buildCleanDocx(commentFile, "docx-comment.docx");
    const commentScan = await scanBytes(cleanedComment.bytes, cleanedComment.fileName);
    expect(commentScan.verdict).toBe("clean");
    expect(commentScan.cleanText.toLowerCase()).not.toContain("papaya");
    expect(commentScan.cleanText.toLowerCase()).toContain("photosynthesis");

    const metadataFile = await readSample("docx-metadata.docx");
    const cleanedMeta = await buildCleanDocx(metadataFile, "docx-metadata.docx");
    const metaScan = await scanBytes(cleanedMeta.bytes, cleanedMeta.fileName);
    expect(metaScan.verdict).toBe("clean");
    expect(metaScan.cleanText.toLowerCase()).not.toContain("kiwi");
  });

  it("writes cleaned pasted text without the injection sentence", async () => {
    const raw = new TextDecoder().decode(await readSample("txt-injection.txt"));
    const scanned = await scanText(raw, "txt-injection.txt");
    const cleaned = buildCleanText(scanned.cleanText, "txt-injection.txt");
    const text = new TextDecoder().decode(cleaned.bytes);
    expect(cleaned.fileName).toBe("txt-injection.clean.txt");
    expect(text.toLowerCase()).toContain("photosynthesis");
    expect(text.toLowerCase()).not.toContain("banana");
    const again = await scanBytes(cleaned.bytes, cleaned.fileName);
    expect(again.verdict).toBe("clean");
  });

  it("puts the verdict and the hidden sentence in the export report", async () => {
    const original = await readSample("pdf-white-text.pdf");
    const scanned = await scanBytes(original, "assignment.pdf");
    const html = buildReportHtml(scanned);
    expect(html).toContain("Traps found: don't paste this into AI yet");
    expect(html).toContain("white on a white");
    expect(html).toContain("White &amp; hidden text");
    expect(safetyScore(scanned.findings)).toBeLessThan(100);
  });
});
