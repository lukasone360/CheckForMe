import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import type { ExtractedDocument, RGB, SourceKind, TextRun } from "../types";
import { ScanError } from "../types";
import { hexToRgb } from "../color";

type XmlNode = {
  nodeType: number;
  localName: string | null;
  textContent: string | null;
  childNodes: ArrayLike<XmlNode>;
  parentNode: XmlNode | null;
  getAttribute: (name: string) => string | null;
};

const HIGHLIGHTS: Record<string, RGB> = {
  yellow: [1, 1, 0],
  green: [0, 1, 0],
  cyan: [0, 1, 1],
  magenta: [1, 0, 1],
  blue: [0, 0, 1],
  red: [1, 0, 0],
  darkblue: [0, 0, 0.5],
  darkcyan: [0, 0.5, 0.5],
  darkgreen: [0, 0.5, 0],
  darkmagenta: [0.5, 0, 0.5],
  darkred: [0.5, 0, 0],
  darkyellow: [0.5, 0.5, 0],
  darkgray: [0.5, 0.5, 0.5],
  lightgray: [0.75, 0.75, 0.75],
  black: [0, 0, 0],
  white: [1, 1, 1],
};

const THEME_COLORS: Record<string, string> = {
  background1: "FFFFFF",
  lt1: "FFFFFF",
  light1: "FFFFFF",
  dark1: "000000",
  tx1: "000000",
  text1: "000000",
  background2: "EEECE1",
  lt2: "EEECE1",
  dark2: "44546A",
  tx2: "44546A",
};

type RunStyle = {
  color?: RGB;
  background?: RGB;
  fontSizePt?: number;
  hiddenFormatting?: string;
};

function elements(node: XmlNode): XmlNode[] {
  const list: XmlNode[] = [];
  for (let index = 0; index < node.childNodes.length; index += 1) {
    const child = node.childNodes[index];
    if (child?.nodeType === 1) list.push(child);
  }
  return list;
}

function childrenNamed(node: XmlNode, local: string): XmlNode[] {
  return elements(node).filter((child) => child.localName === local);
}

function descendantsNamed(node: XmlNode, local: string): XmlNode[] {
  const found: XmlNode[] = [];
  const walk = (current: XmlNode) => {
    for (const child of elements(current)) {
      if (child.localName === local) found.push(child);
      walk(child);
    }
  };
  walk(node);
  return found;
}

function ancestor(node: XmlNode, local: string): XmlNode | null {
  let current = node.parentNode;
  while (current && current.nodeType === 1) {
    if (current.localName === local) return current;
    current = current.parentNode;
  }
  return null;
}

function attr(node: XmlNode, name: string): string | null {
  return (
    node.getAttribute(name) ??
    node.getAttribute(`w:${name}`) ??
    node.getAttribute(`r:${name}`) ??
    node.getAttribute(`xml:${name}`)
  );
}

function flagOn(node: XmlNode | undefined): boolean {
  if (!node) return false;
  const value = attr(node, "val");
  if (value == null || value === "") return true;
  return !["0", "false", "off", "none"].includes(value.toLowerCase());
}

function wordColor(node: XmlNode | undefined): RGB | undefined {
  if (!node) return undefined;
  const value = attr(node, "val");
  if (value && value.toLowerCase() !== "auto") {
    const rgb = hexToRgb(value);
    if (rgb) return rgb;
  }
  const theme = attr(node, "themeColor")?.toLowerCase();
  if (theme && THEME_COLORS[theme]) return hexToRgb(THEME_COLORS[theme]);
  return undefined;
}

function parseRPr(node: XmlNode | undefined): RunStyle {
  if (!node) return {};
  const style: RunStyle = {};
  const color = childrenNamed(node, "color")[0];
  const rgb = wordColor(color);
  if (rgb) style.color = rgb;

  const sizeNode = childrenNamed(node, "sz")[0] ?? childrenNamed(node, "szCs")[0];
  const sizeRaw = sizeNode ? attr(sizeNode, "val") : null;
  const size = sizeRaw == null ? undefined : Number(sizeRaw);
  if (size != null && Number.isFinite(size)) style.fontSizePt = size / 2;

  const hidden: string[] = [];
  if (flagOn(childrenNamed(node, "vanish")[0])) hidden.push("vanish");
  if (flagOn(childrenNamed(node, "webHidden")[0])) hidden.push("web hidden");
  if (flagOn(childrenNamed(node, "specVanish")[0])) hidden.push("spec vanish");
  if (hidden.length > 0) style.hiddenFormatting = hidden.join(", ");

  const highlight = childrenNamed(node, "highlight")[0];
  const highlightName = highlight ? attr(highlight, "val")?.toLowerCase() : undefined;
  if (highlightName && HIGHLIGHTS[highlightName]) style.background = HIGHLIGHTS[highlightName];

  const shading = childrenNamed(node, "shd")[0];
  const fill = shading ? attr(shading, "fill") : null;
  if (fill && fill.toLowerCase() !== "auto") {
    const shaded = hexToRgb(fill);
    if (shaded) style.background = shaded;
  }
  return style;
}

function mergeStyle(base: RunStyle, extra: RunStyle): RunStyle {
  return {
    color: extra.color ?? base.color,
    background: extra.background ?? base.background,
    fontSizePt: extra.fontSizePt ?? base.fontSizePt,
    hiddenFormatting: extra.hiddenFormatting ?? base.hiddenFormatting,
  };
}

function runText(run: XmlNode): { text: string; deleted: boolean } {
  let text = "";
  let deleted = ancestor(run, "del") != null;
  const walk = (node: XmlNode) => {
    for (const child of elements(node)) {
      if (child.localName === "drawing" || child.localName === "txbxContent" || child.localName === "pict") {
        continue;
      }
      if (child.localName === "t" || child.localName === "instrText") {
        text += child.textContent ?? "";
      } else if (child.localName === "delText") {
        text += child.textContent ?? "";
        deleted = true;
      } else if (child.localName === "tab") {
        text += "\t";
      } else if (child.localName === "br" || child.localName === "cr") {
        text += "\n";
      } else if (child.localName !== "rPr") {
        walk(child);
      }
    }
  };
  walk(run);
  return { text, deleted };
}

function textboxFlags(paragraph: XmlNode): { offPage: boolean; behind: boolean } | null {
  if (!ancestor(paragraph, "txbxContent")) return null;
  let offPage = false;
  let behind = false;
  let current: XmlNode | null = paragraph;
  while (current && current.nodeType === 1) {
    if (current.localName === "anchor" || current.localName === "shape") {
      const behindDoc = attr(current, "behindDoc");
      if (behindDoc === "1" || behindDoc === "true") behind = true;
      const style = attr(current, "style") ?? "";
      const left = /margin-left:\s*(-?\d+(?:\.\d+)?)pt/i.exec(style);
      const top = /margin-top:\s*(-?\d+(?:\.\d+)?)pt/i.exec(style);
      if (left && Number(left[1]) < -36) offPage = true;
      if (top && Number(top[1]) < -36) offPage = true;
    }
    for (const child of elements(current)) {
      if (child.localName !== "positionH" && child.localName !== "positionV") continue;
      const offset = childrenNamed(child, "posOffset")[0]?.textContent?.trim();
      const emu = offset == null ? Number.NaN : Number(offset);
      if (!Number.isFinite(emu)) continue;
      if (emu < -36000 || emu > 9_000_000) offPage = true;
    }
    current = current.parentNode;
  }
  return { offPage, behind };
}

function paragraphsIn(root: XmlNode): XmlNode[] {
  return descendantsNamed(root, "p");
}

function parseXml(xml: string): XmlNode {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const root = doc.documentElement as unknown as XmlNode;
  if (!root || root.localName === "parsererror") {
    throw new ScanError("A document XML part could not be read.");
  }
  return root;
}

const PAINTED = new Set<SourceKind>(["body", "header", "footer", "footnote", "endnote", "textbox", "deleted"]);

function pushParagraphRuns(
  runs: TextRun[],
  paragraph: XmlNode,
  source: SourceKind,
  location: string,
  options: { offPage?: boolean; behind?: boolean },
) {
  const paragraphStyle = parseRPr(childrenNamed(childrenNamed(paragraph, "pPr")[0] ?? ({ childNodes: [] } as unknown as XmlNode), "rPr")[0]);
  const runNodes = descendantsNamed(paragraph, "r").filter((run) => ancestor(run, "p") === paragraph);
  let emitted = 0;
  for (const run of runNodes) {
    const { text, deleted } = runText(run);
    if (!text) continue;
    const style = mergeStyle(paragraphStyle, parseRPr(childrenNamed(run, "rPr")[0]));
    const paintedSource: SourceKind = deleted ? "deleted" : source;
    const runLocation = deleted ? `${location} (tracked change)` : location;
    const entry: TextRun = {
      text,
      source: paintedSource,
      location: runLocation,
      offPage: options.offPage,
      coverKind: options.behind ? "behind" : undefined,
      hiddenFormatting: style.hiddenFormatting,
      blockId: `${location}`,
      spacerBefore: emitted === 0 ? (runs.some((item) => PAINTED.has(item.source)) ? "\n" : "") : "",
    };
    if (PAINTED.has(paintedSource)) {
      entry.color = style.color ?? [0, 0, 0];
      entry.background = style.background ?? [1, 1, 1];
      entry.opacity = 1;
      if (style.fontSizePt != null) entry.fontSizePt = style.fontSizePt;
    }
    runs.push(entry);
    emitted += 1;
  }
}

function readStory(runs: TextRun[], xml: string, source: SourceKind, label: string) {
  const root = parseXml(xml);
  const paragraphs = paragraphsIn(root);
  let index = 0;
  for (const paragraph of paragraphs) {
    const box = textboxFlags(paragraph);
    index += 1;
    if (box) {
      const where = box.offPage ? "Text box, off the page" : "Text box";
      pushParagraphRuns(runs, paragraph, "textbox", where, { offPage: box.offPage, behind: box.behind });
      continue;
    }
    pushParagraphRuns(runs, paragraph, source, `${label}, paragraph ${index}`, {});
  }
}

function readComments(runs: TextRun[], xml: string) {
  const root = parseXml(xml);
  const comments = descendantsNamed(root, "comment");
  comments.forEach((comment, index) => {
    const author = attr(comment, "author") || "unknown author";
    const text = paragraphsIn(comment)
      .map((paragraph) => paragraph.textContent ?? "")
      .join("\n")
      .trim();
    if (!text) return;
    runs.push({
      text,
      source: "comment",
      location: `Comment by ${author}`,
      blockId: `comment-${index}`,
      spacerBefore: "",
    });
  });
}

function readMetadata(runs: TextRun[], xml: string) {
  const root = parseXml(xml);
  const wanted = ["title", "subject", "description", "keywords", "creator", "category"];
  for (const name of wanted) {
    for (const node of descendantsNamed(root, name)) {
      const text = (node.textContent ?? "").trim();
      if (!text) continue;
      runs.push({
        text,
        source: "metadata",
        location: `Document metadata (${name})`,
        spacerBefore: "",
      });
    }
  }
  for (const property of descendantsNamed(root, "property")) {
    const name = attr(property, "name") || "custom";
    const text = (property.textContent ?? "").trim();
    if (!text) continue;
    runs.push({
      text,
      source: "metadata",
      location: `Document metadata (${name})`,
      spacerBefore: "",
    });
  }
}

function readAltAndForms(runs: TextRun[], xml: string) {
  const root = parseXml(xml);
  const seenAlt = new Set<string>();
  const all = descendantsNamed(root, "docPr").concat(descendantsNamed(root, "cNvPr"));
  for (const node of all) {
    const descr = attr(node, "descr")?.trim();
    if (!descr || seenAlt.has(descr)) continue;
    seenAlt.add(descr);
    runs.push({
      text: descr,
      source: "alt",
      location: "Image alt text",
      spacerBefore: "",
    });
  }

  for (const field of descendantsNamed(root, "ffData")) {
    const name = attr(childrenNamed(field, "name")[0] ?? field, "val") || "form field";
    const defaults = descendantsNamed(field, "default");
    const text = defaults
      .map((node) => attr(node, "val") || node.textContent || "")
      .join(" ")
      .trim();
    if (!text) continue;
    runs.push({
      text,
      source: "form",
      location: `Form field “${name}”`,
      spacerBefore: "",
    });
  }

  for (const tag of descendantsNamed(root, "tag").concat(descendantsNamed(root, "alias"))) {
    if (ancestor(tag, "sdtPr") == null && ancestor(tag, "sdt") == null) continue;
    const text = attr(tag, "val")?.trim();
    if (!text || text.length < 24) continue;
    runs.push({
      text,
      source: "form",
      location: "Content control",
      spacerBefore: "",
    });
  }
}

async function readZipText(zip: JSZip, path: string): Promise<string | undefined> {
  const file = zip.file(path);
  if (!file) return undefined;
  return file.async("string");
}

export async function extractDocx(data: Uint8Array, fileName: string): Promise<ExtractedDocument> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new ScanError("This DOCX could not be opened. It may be damaged.");
  }

  const names = Object.keys(zip.files);
  const documentXml = await readZipText(zip, "word/document.xml");
  if (!documentXml) {
    if (names.some((name) => name.startsWith("xl/"))) {
      throw new ScanError("Spreadsheets are not supported in this version. Export the file as PDF or DOCX and scan that.");
    }
    if (names.some((name) => name.startsWith("ppt/"))) {
      throw new ScanError("Presentations are not supported in this version. Export the file as PDF or DOCX and scan that.");
    }
    throw new ScanError("This file is not a Word document (.docx).");
  }

  const runs: TextRun[] = [];
  readStory(runs, documentXml, "body", "Body");
  readAltAndForms(runs, documentXml);

  for (const name of names.sort()) {
    if (/^word\/header\d+\.xml$/.test(name)) {
      const xml = await readZipText(zip, name);
      if (xml) readStory(runs, xml, "header", "Header");
    } else if (/^word\/footer\d+\.xml$/.test(name)) {
      const xml = await readZipText(zip, name);
      if (xml) readStory(runs, xml, "footer", "Footer");
    } else if (name === "word/comments.xml") {
      const xml = await readZipText(zip, name);
      if (xml) readComments(runs, xml);
    } else if (name === "word/footnotes.xml" || name === "word/endnotes.xml") {
      const xml = await readZipText(zip, name);
      if (!xml) continue;
      const source: SourceKind = name.includes("endnotes") ? "endnote" : "footnote";
      const label = source === "endnote" ? "Endnote" : "Footnote";
      const root = parseXml(xml);
      for (const note of descendantsNamed(root, source === "endnote" ? "endnote" : "footnote")) {
        const type = attr(note, "type");
        if (type === "separator" || type === "continuationSeparator") continue;
        const id = attr(note, "id") || "";
        paragraphsIn(note).forEach((paragraph, index) => {
          pushParagraphRuns(runs, paragraph, source, `${label} ${id || index + 1}`, {});
        });
      }
    } else if (name === "docProps/core.xml" || name === "docProps/custom.xml") {
      const xml = await readZipText(zip, name);
      if (xml) readMetadata(runs, xml);
    } else if (name.startsWith("word/") && name.endsWith(".xml")) {
      const xml = await readZipText(zip, name);
      if (xml) readAltAndForms(runs, xml);
    }
  }

  return { fileName, fileType: "docx", runs };
}
