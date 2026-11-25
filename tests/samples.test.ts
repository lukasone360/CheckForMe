import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { scanBytes } from "@/lib/scan";
import type { FindingType, ScanResult, Verdict } from "@/lib/types";

async function scan(name: string): Promise<ScanResult> {
  const bytes = await readFile(new URL(`../samples/${name}`, import.meta.url));
  return scanBytes(new Uint8Array(bytes), name);
}

function expectTrap(result: ScanResult, type: FindingType, verdict: Verdict = "traps_found") {
  expect(result.findings.some((finding) => finding.type === type), JSON.stringify(result.findings, null, 2)).toBe(true);
  expect(result.verdict).toBe(verdict);
}

describe("sample files", () => {
  it("reads clean PDF, DOCX, and text as clean", async () => {
    for (const name of ["clean.pdf", "clean.docx", "clean.txt"]) {
      const result = await scan(name);
      expect(result.findings, name).toEqual([]);
      expect(result.verdict, name).toBe("clean");
      expect(result.cleanText.toLowerCase()).toContain("photosynthesis");
    }
  });

  it("detects white text in PDF and DOCX, including a white header", async () => {
    for (const name of ["pdf-white-text.pdf", "docx-white-text.docx"]) {
      const result = await scan(name);
      expectTrap(result, "white-text");
      expect(result.cleanText.toLowerCase()).toContain("photosynthesis");
      expect(result.cleanText.toLowerCase()).not.toContain("white on a white");
    }
    const header = await scan("docx-header.docx");
    expectTrap(header, "white-text");
    expect(header.findings.some((finding) => /header/i.test(finding.location))).toBe(true);
    expect(header.findings.some((finding) => finding.text.includes("Biology"))).toBe(false);
    expect(header.cleanText).toContain("Biology 101");
  });

  it("detects tiny fonts, transparency, invisible rendering, and low contrast", async () => {
    expectTrap(await scan("pdf-tiny-text.pdf"), "tiny-font");
    expectTrap(await scan("docx-tiny.docx"), "tiny-font");
    expectTrap(await scan("pdf-transparent.pdf"), "transparent");
    expectTrap(await scan("pdf-invisible-render.pdf"), "invisible-render");
    expectTrap(await scan("pdf-low-contrast.pdf"), "low-contrast");
    expectTrap(await scan("docx-low-contrast.docx"), "low-contrast");
    expectTrap(await scan("docx-vanish.docx"), "hidden-formatting");
  });

  it("detects off-page text and text covered by a shape", async () => {
    const offPdf = await scan("pdf-off-page.pdf");
    expectTrap(offPdf, "off-page");
    expect(offPdf.cleanText.toLowerCase()).not.toContain("off the page");

    const offDocx = await scan("docx-off-page.docx");
    expectTrap(offDocx, "off-page");
    expect(offDocx.findings.some((finding) => /text box/i.test(finding.location))).toBe(true);

    const covered = await scan("pdf-covered.pdf");
    expectTrap(covered, "covered");
    expect(covered.cleanText.toLowerCase()).not.toContain("covered by a shape");
    expect(covered.cleanText.toLowerCase()).toContain("photosynthesis");
  });

  it("detects zero-width characters, bidi overrides, and homoglyphs", async () => {
    for (const name of ["pdf-zerowidth.pdf", "docx-zerowidth.docx", "txt-zerowidth.txt"]) {
      const result = await scan(name);
      expectTrap(result, "zero-width");
      expect(result.cleanText).not.toContain("\u200B");
      expect(result.cleanText).toContain("mitochondria");
    }
    for (const name of ["pdf-bidi.pdf", "docx-bidi.docx", "txt-bidi.txt"]) {
      const result = await scan(name);
      expectTrap(result, "bidi");
      expect(result.cleanText).not.toContain("\u202E");
    }
    for (const name of ["pdf-homoglyph.pdf", "docx-homoglyph.docx", "txt-homoglyph.txt"]) {
      const result = await scan(name);
      expectTrap(result, "homoglyph", "suspicious");
    }
  });

  it("detects prompt injection in visible text, metadata, comments, alt text, form fields, and annotations", async () => {
    const pasted = await scan("txt-injection.txt");
    expectTrap(pasted, "prompt-injection");
    expect(pasted.cleanText.toLowerCase()).toContain("photosynthesis");
    expect(pasted.cleanText.toLowerCase()).not.toContain("banana");

    const metadataPdf = await scan("pdf-metadata.pdf");
    expectTrap(metadataPdf, "prompt-injection");
    expect(metadataPdf.findings.some((finding) => finding.type === "metadata")).toBe(true);
    expect(metadataPdf.cleanText.toLowerCase()).not.toContain("koala");

    const metadataDocx = await scan("docx-metadata.docx");
    expectTrap(metadataDocx, "prompt-injection");
    expect(metadataDocx.findings.some((finding) => /metadata/i.test(finding.location))).toBe(true);

    const comment = await scan("docx-comment.docx");
    expectTrap(comment, "prompt-injection");
    expect(comment.findings.some((finding) => finding.type === "comment")).toBe(true);
    expect(comment.cleanText.toLowerCase()).not.toContain("papaya");

    const alt = await scan("docx-alt-text.docx");
    expectTrap(alt, "prompt-injection");
    expect(alt.findings.some((finding) => finding.type === "alt-text")).toBe(true);

    const form = await scan("docx-form-field.docx");
    expectTrap(form, "prompt-injection");
    expect(form.findings.some((finding) => finding.type === "form-field")).toBe(true);

    const annotation = await scan("pdf-annotation.pdf");
    expectTrap(annotation, "prompt-injection");
    expect(annotation.findings.some((finding) => /annotation/i.test(finding.location))).toBe(true);
    expect(annotation.cleanText.toLowerCase()).not.toContain("violin");
  });

  it("detects instructions left behind in tracked changes", async () => {
    const result = await scan("docx-tracked-change.docx");
    expectTrap(result, "tracked-change");
    expect(result.findings.some((finding) => finding.type === "prompt-injection")).toBe(true);
    expect(result.cleanText.toLowerCase()).not.toContain("zebra");
  });
});
