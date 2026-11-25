import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { planRunCleanup } from "./analyze";
import { extractDocx } from "./extract/docx";
import type { Finding, ScanResult } from "./types";
import { safetyScore } from "./categories";
import { groupFindings } from "./categories";

export type CleanFile = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
};

function cleanName(fileName: string, extension: string): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "assignment";
  return `${base}.clean.${extension}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitizePdfText(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (char === "\n") {
      out += "\n";
      continue;
    }
    if (code === 9) {
      out += " ";
      continue;
    }
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) out += char;
  }
  return out;
}

type PdfFont = { widthOfTextAtSize: (text: string, size: number) => number };

function wrapLine(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** A new PDF that keeps the cleaned wording and leaves the traps out. */
export async function buildCleanPdf(cleanText: string, fileName: string): Promise<CleanFile> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 12;
  const margin = 72;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const leading = 18;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  const safe = sanitizePdfText(cleanText.trim() || "No visible assignment text remained after removing hidden traps.");

  for (const paragraph of safe.split("\n")) {
    const lines = wrapLine(paragraph, font, fontSize, maxWidth);
    const drawn = lines.length > 0 ? lines : [""];
    for (const line of drawn) {
      if (y < margin) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      if (line) {
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.08, 0.12, 0.18) });
      }
      y -= leading;
    }
    y -= 6;
  }

  doc.setTitle("Cleaned assignment");
  doc.setProducer("CheckForMe");
  const bytes = await doc.save();
  return {
    bytes,
    fileName: cleanName(fileName, "pdf"),
    mimeType: "application/pdf",
  };
}

type XmlElement = {
  localName: string | null;
  textContent: string | null;
  childNodes: ArrayLike<XmlElement>;
  parentNode: XmlElement | null;
  nodeType: number;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  removeChild: (child: XmlElement) => void;
};

function childElements(node: XmlElement): XmlElement[] {
  const list: XmlElement[] = [];
  for (let index = 0; index < node.childNodes.length; index += 1) {
    const child = node.childNodes[index];
    if (child?.nodeType === 1) list.push(child);
  }
  return list;
}

function descendants(node: XmlElement, local: string): XmlElement[] {
  const found: XmlElement[] = [];
  const walk = (current: XmlElement) => {
    for (const child of childElements(current)) {
      if (child.localName === local) found.push(child);
      walk(child);
    }
  };
  walk(node);
  return found;
}

function ancestor(node: XmlElement, local: string): XmlElement | null {
  let current = node.parentNode;
  while (current && current.nodeType === 1) {
    if (current.localName === local) return current;
    current = current.parentNode;
  }
  return null;
}

function attr(node: XmlElement, name: string): string | null {
  return node.getAttribute(name) ?? node.getAttribute(`w:${name}`);
}

function parseXml(xml: string): XmlElement {
  return new DOMParser().parseFromString(xml, "text/xml").documentElement as unknown as XmlElement;
}

function serializeXml(root: XmlElement): string {
  const body = new XMLSerializer().serializeToString(root as never);
  if (body.startsWith("<?xml")) return body;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${body}`;
}

function applyTextEdits(root: XmlElement, dropTexts: Set<string>, rewrites: Map<string, string>) {
  for (const node of descendants(root, "t").concat(descendants(root, "delText"))) {
    const text = node.textContent ?? "";
    const key = text.trim();
    if (!key) continue;
    if (dropTexts.has(key) || dropTexts.has(text)) {
      const run = ancestor(node, "r") ?? node;
      run.parentNode?.removeChild(run);
      continue;
    }
    const replacement = rewrites.get(key) ?? rewrites.get(text);
    if (replacement == null) continue;
    if (!replacement.trim()) {
      const run = ancestor(node, "r") ?? node;
      run.parentNode?.removeChild(run);
    } else {
      node.textContent = replacement;
    }
  }

  for (const comment of descendants(root, "comment")) {
    const text = (comment.textContent ?? "").trim();
    if (text && dropTexts.has(text)) comment.parentNode?.removeChild(comment);
  }

  for (const node of descendants(root, "default")) {
    const value = attr(node, "val")?.trim();
    if (value && dropTexts.has(value)) node.setAttribute("w:val", "");
  }

  for (const node of descendants(root, "docPr").concat(descendants(root, "cNvPr"))) {
    const descr = attr(node, "descr")?.trim();
    if (descr && dropTexts.has(descr)) node.setAttribute("descr", "");
  }
}

function clearMetadata(root: XmlElement, dropTexts: Set<string>) {
  const walk = (node: XmlElement) => {
    const text = (node.textContent ?? "").trim();
    const onlyThisNode = childElements(node).length === 0;
    if (onlyThisNode && text && dropTexts.has(text)) {
      node.textContent = "";
      return;
    }
    for (const child of childElements(node)) walk(child);
  };
  walk(root);
}

/** DOCX with trap runs, comments, and poisoned metadata removed. Safe text stays. */
export async function buildCleanDocx(data: Uint8Array, fileName: string): Promise<CleanFile> {
  const extracted = await extractDocx(data, fileName);
  const dropTexts = new Set<string>();
  const rewrites = new Map<string, string>();
  for (const run of extracted.runs) {
    const plan = planRunCleanup(run);
    const key = run.text.trim();
    if (!key) continue;
    if (plan.action === "drop") dropTexts.add(key);
    if (plan.action === "rewrite") rewrites.set(key, plan.text);
  }

  const zip = await JSZip.loadAsync(data);
  const targets = Object.keys(zip.files).filter((name) => {
    if (name === "word/document.xml" || name === "word/comments.xml") return true;
    if (name === "docProps/core.xml" || name === "docProps/custom.xml") return true;
    return /^word\/(header|footer|footnotes|endnotes)\d*\.xml$/.test(name) || /^word\/(footnotes|endnotes)\.xml$/.test(name);
  });

  for (const name of targets) {
    const xml = await zip.file(name)?.async("string");
    if (!xml) continue;
    const root = parseXml(xml);
    if (name.startsWith("docProps/")) clearMetadata(root, dropTexts);
    else applyTextEdits(root, dropTexts, rewrites);
    zip.file(name, serializeXml(root));
  }

  const bytes = await zip.generateAsync({ type: "uint8array" });
  return {
    bytes,
    fileName: cleanName(fileName, "docx"),
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}

export function buildCleanText(cleanText: string, fileName: string): CleanFile {
  return {
    bytes: new TextEncoder().encode(cleanText),
    fileName: cleanName(fileName, "txt"),
    mimeType: "text/plain;charset=utf-8",
  };
}

export async function buildCleanDownload(result: ScanResult, original?: Uint8Array | null): Promise<CleanFile> {
  if (result.fileType === "docx" && original) return buildCleanDocx(original, result.fileName);
  if (result.fileType === "pdf") return buildCleanPdf(result.cleanText, result.fileName);
  const name = result.fileName.toLowerCase().endsWith(".txt") ? result.fileName : "pasted-text.txt";
  return buildCleanText(result.cleanText, name);
}

export function buildReportHtml(result: ScanResult): string {
  const score = safetyScore(result.findings);
  const groups = groupFindings(result.findings);
  const verdict =
    result.verdict === "clean"
      ? "Looks clean, safe to paste"
      : result.verdict === "suspicious"
        ? "Suspicious: review these signals before you paste"
        : "Traps found: don't paste this into AI yet";
  const rows = groups
    .map((group) => {
      const items =
        group.findings.length === 0
          ? "<p>Clean</p>"
          : group.findings
              .map(
                (finding: Finding) =>
                  `<li><blockquote>${escapeHtml(finding.text)}</blockquote><p>${escapeHtml(finding.location)} · ${escapeHtml(finding.severity)}</p></li>`,
              )
              .join("");
      return `<section><h2>${escapeHtml(group.label)}</h2>${group.findings.length ? `<ul>${items}</ul>` : items}</section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CheckForMe report — ${escapeHtml(result.fileName)}</title>
  <style>
    body { font-family: Georgia, serif; color: #142033; margin: 48px auto; max-width: 720px; line-height: 1.5; }
    h1 { font-family: "Segoe UI", sans-serif; margin-bottom: 0; }
    .meta { color: #5c6b80; }
    .verdict { padding: 12px 16px; border-radius: 10px; background: #f6f8fb; }
    blockquote { margin: 8px 0; padding: 8px 12px; background: #fff6d8; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
  <h1>CheckForMe scan report</h1>
  <p class="meta">${escapeHtml(result.fileName)} · safety score ${score}/100</p>
  <p class="verdict">${escapeHtml(verdict)}</p>
  ${rows}
  <h2>Cleaned text</h2>
  <pre>${escapeHtml(result.cleanText || "(nothing left after removing traps)")}</pre>
</body>
</html>`;
}
