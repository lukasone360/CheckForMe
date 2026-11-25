import { analyzeDocument } from "./analyze";
import { extractDocx } from "./extract/docx";
import { extractPdf } from "./extract/pdf";
import { extractPlainText } from "./extract/text";
import type { ScanResult } from "./types";
import { ScanError } from "./types";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

function startsWith(data: Uint8Array, text: string): boolean {
  if (data.length < text.length) return false;
  for (let index = 0; index < text.length; index += 1) {
    if (data[index] !== text.charCodeAt(index)) return false;
  }
  return true;
}

function looksLikeText(data: Uint8Array): boolean {
  const sample = data.subarray(0, Math.min(data.length, 4000));
  let suspicious = 0;
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte < 9 || (byte > 13 && byte < 32)) suspicious += 1;
  }
  return suspicious / Math.max(sample.length, 1) < 0.02;
}

export async function scanBytes(data: Uint8Array, fileName: string): Promise<ScanResult> {
  if (data.byteLength === 0) {
    throw new ScanError("That file is empty.");
  }
  if (data.byteLength > MAX_FILE_BYTES) {
    throw new ScanError("Files need to be 20 MB or smaller. Split the assignment and scan each part.");
  }

  const lower = fileName.toLowerCase();
  if (startsWith(data, "%PDF") || lower.endsWith(".pdf")) {
    return analyzeDocument(await extractPdf(data, fileName));
  }
  if (startsWith(data, "PK") || lower.endsWith(".docx")) {
    return analyzeDocument(await extractDocx(data, fileName));
  }
  if (lower.endsWith(".doc")) {
    throw new ScanError("Older .doc files are not supported. Save the document as .docx or PDF and scan that.");
  }
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
    throw new ScanError("Presentations are not supported in this version. Export the file as PDF or DOCX and scan that.");
  }
  if (
    lower.endsWith(".txt") ||
    lower.endsWith(".text") ||
    lower.endsWith(".md") ||
    looksLikeText(data)
  ) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(data);
    return analyzeDocument(extractPlainText(text, fileName || "Pasted text"));
  }
  throw new ScanError("This version reads PDF, DOCX, and plain text. Export other files to PDF or DOCX first.");
}

export async function scanText(text: string, fileName = "Pasted text"): Promise<ScanResult> {
  return analyzeDocument(extractPlainText(text, fileName));
}

export async function scanFile(file: File): Promise<ScanResult> {
  const buffer = await file.arrayBuffer();
  return scanBytes(new Uint8Array(buffer), file.name || "assignment");
}
