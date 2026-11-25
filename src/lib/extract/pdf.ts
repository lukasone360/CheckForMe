import type { ExtractedDocument, RGB, TextRun } from "../types";
import { ScanError } from "../types";
import { cmykToRgb, grayToRgb, normalizeRgb, WHITE } from "../color";
import { buildMetadataFields, type MetadataField } from "../metadata-fields";

type Mat = [number, number, number, number, number, number];
type Rect = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

type GState = {
  ctm: Mat;
  fill: RGB;
  stroke: RGB;
  fillOpacity: number;
  strokeOpacity: number;
  fontSize: number;
  textMatrix: Mat;
  lineMatrix: Mat;
  textRenderingMode: number;
  hScale: number;
  leading: number;
};

type Paint = { rect: Rect; opacity: number; order: number };
type Draft = TextRun & { order: number; x: number; y: number; width: number; height: number };

const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];

function cloneState(state: GState): GState {
  return {
    ctm: [...state.ctm],
    fill: [...state.fill],
    stroke: [...state.stroke],
    fillOpacity: state.fillOpacity,
    strokeOpacity: state.strokeOpacity,
    fontSize: state.fontSize,
    textMatrix: [...state.textMatrix],
    lineMatrix: [...state.lineMatrix],
    textRenderingMode: state.textRenderingMode,
    hScale: state.hScale,
    leading: state.leading,
  };
}

function mul(m1: Mat, m2: Mat): Mat {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function apply(matrix: Mat, x: number, y: number): Point {
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5],
  };
}

function transformRect(rect: Rect, matrix: Mat): Rect {
  const corners = [
    apply(matrix, rect.x, rect.y),
    apply(matrix, rect.x + rect.w, rect.y),
    apply(matrix, rect.x, rect.y + rect.h),
    apply(matrix, rect.x + rect.w, rect.y + rect.h),
  ];
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function asNumberList(value: unknown): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (ArrayBuffer.isView(value)) return Array.from(value as unknown as ArrayLike<number>);
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return value as number[];
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const nums: number[] = [];
    for (let index = 0; index < 8; index += 1) {
      const entry = record[index] ?? record[String(index)];
      if (typeof entry !== "number") break;
      nums.push(entry);
    }
    return nums;
  }
  return [];
}

function applyGState(state: GState, args: unknown) {
  const pairs: Array<[string, unknown]> = [];
  const walk = (node: unknown) => {
    if (!Array.isArray(node)) return;
    if (node.length >= 2 && typeof node[0] === "string") {
      pairs.push([node[0], node[1]]);
      return;
    }
    for (const item of node) walk(item);
  };
  walk(args);
  for (const [key, raw] of pairs) {
    if (typeof raw !== "number") continue;
    if (key === "ca") state.fillOpacity = raw;
    if (key === "CA") state.strokeOpacity = raw;
  }
}

function glyphsOf(args: unknown): unknown[] {
  if (!Array.isArray(args) || args.length === 0) return [];
  const first = args[0];
  if (Array.isArray(first)) return first;
  if (typeof first === "number") return args;
  if (first && typeof first === "object" && "unicode" in (first as object)) return args;
  return [];
}

function pageFontSize(fontSize: number, textMatrix: Mat, ctm: Mat): number {
  const origin = apply(textMatrix, 0, 0);
  const tip = apply(textMatrix, 0, fontSize);
  const pageOrigin = apply(ctm, origin.x, origin.y);
  const pageTip = apply(ctm, tip.x, tip.y);
  const size = Math.hypot(pageTip.x - pageOrigin.x, pageTip.y - pageOrigin.y);
  return size || fontSize;
}

function intersectionArea(a: Rect, b: Rect): number {
  const width = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return width * height;
}

function assetUrl(relative: string): string {
  if (typeof window !== "undefined") return relative;
  const cwd = process.cwd().replace(/\\/g, "/");
  return `file://${cwd}/${relative.replace(/^\//, "")}`;
}

type PdfjsModule = {
  getDocument: (options: Record<string, unknown>) => { promise: Promise<PdfDocument> };
  OPS: Record<string, number>;
  GlobalWorkerOptions: { workerSrc: string };
};

type PdfMetadataObject = {
  getAll?: () => Map<string, unknown> | Record<string, unknown>;
  getRaw?: () => string;
};

type PdfDocument = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
  getMetadata: () => Promise<{ info?: Record<string, unknown>; metadata?: PdfMetadataObject | null }>;
  destroy: () => Promise<void>;
};

export type PdfMetadataReport = {
  fileName: string;
  pageCount: number;
  fields: MetadataField[];
};

type PdfPage = {
  view: number[];
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[] }>;
  getAnnotations: (options?: { intent?: string }) => Promise<Array<Record<string, unknown>>>;
};

let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => mod as unknown as PdfjsModule);
  }
  return pdfjsPromise;
}

function describePosition(page: number, x: number, y: number, pageBox: Rect, offPage: boolean): string {
  if (offPage) {
    return `Page ${page}, off the page (x ${Math.round(x)} pt, y ${Math.round(y)} pt)`;
  }
  const fromTop = pageBox.y + pageBox.h - y;
  const band = fromTop < pageBox.h * 0.33 ? "near the top" : fromTop > pageBox.h * 0.66 ? "near the bottom" : "around the middle";
  return `Page ${page}, ${band}`;
}

function initialState(): GState {
  return {
    ctm: [...IDENTITY],
    fill: [0, 0, 0],
    stroke: [0, 0, 0],
    fillOpacity: 1,
    strokeOpacity: 1,
    fontSize: 12,
    textMatrix: [...IDENTITY],
    lineMatrix: [...IDENTITY],
    textRenderingMode: 0,
    hScale: 100,
    leading: 0,
  };
}

function readPathBBox(args: unknown): Rect | null {
  if (!Array.isArray(args)) return null;
  const bbox = args[2];
  if (Array.isArray(bbox) && bbox.length >= 4 && bbox.slice(0, 4).every((n) => typeof n === "number")) {
    const [minX, minY, maxX, maxY] = bbox as number[];
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  return null;
}

async function extractPage(
  pdfjs: PdfjsModule,
  page: PdfPage,
  pageNumber: number,
): Promise<Draft[]> {
  const view = page.view;
  const pageBox: Rect = {
    x: view[0] ?? 0,
    y: view[1] ?? 0,
    w: (view[2] ?? 0) - (view[0] ?? 0),
    h: (view[3] ?? 0) - (view[1] ?? 0),
  };
  const ops = pdfjs.OPS;
  const list = await page.getOperatorList();
  const state = initialState();
  const stack: GState[] = [];
  let pending: Rect | null = null;
  const drafts: Draft[] = [];
  const paints: Paint[] = [];

  const show = (args: unknown, order: number) => {
    let text = "";
    let widthUnits = 0;
    for (const glyph of glyphsOf(args)) {
      if (typeof glyph === "number") {
        widthUnits -= glyph;
        continue;
      }
      if (!glyph || typeof glyph !== "object") continue;
      const record = glyph as { unicode?: string; width?: number };
      text += record.unicode ?? "";
      widthUnits += record.width ?? 0;
    }
    if (!text) return;

    const mode = state.textRenderingMode;
    const color = mode === 1 || mode === 5 ? state.stroke : state.fill;
    const opacity = mode === 1 || mode === 5 ? state.strokeOpacity : state.fillOpacity;
    const fontSize = pageFontSize(state.fontSize, state.textMatrix, state.ctm);
    const localOrigin = apply(state.textMatrix, 0, 0);
    const origin = apply(state.ctm, localOrigin.x, localOrigin.y);
    const advance = (widthUnits / 1000) * state.fontSize * (state.hScale / 100);
    const localEnd = apply(state.textMatrix, advance, 0);
    const end = apply(state.ctm, localEnd.x, localEnd.y);
    const width = Math.hypot(end.x - origin.x, end.y - origin.y);
    const visual: Rect = {
      x: Math.min(origin.x, end.x),
      y: origin.y - fontSize * 0.25,
      w: Math.max(width, 1),
      h: Math.max(fontSize, 1),
    };
    const center = { x: visual.x + visual.w / 2, y: visual.y + visual.h / 2 };
    const offPage =
      center.x < pageBox.x - 2 ||
      center.y < pageBox.y - 2 ||
      center.x > pageBox.x + pageBox.w + 2 ||
      center.y > pageBox.y + pageBox.h + 2;

    drafts.push({
      order,
      text,
      source: "body",
      location: describePosition(pageNumber, origin.x, origin.y, pageBox, offPage),
      page: pageNumber,
      color,
      background: WHITE,
      opacity,
      fontSizePt: fontSize,
      renderMode: mode,
      offPage,
      blockId: `p${pageNumber}-y${Math.round(origin.y)}`,
      x: visual.x,
      y: visual.y,
      width: visual.w,
      height: visual.h,
    });
  };

  for (let index = 0; index < list.fnArray.length; index += 1) {
    const fn = list.fnArray[index];
    const args = list.argsArray[index];
    if (fn === ops.save) {
      stack.push(cloneState(state));
      continue;
    }
    if (fn === ops.restore) {
      const previous = stack.pop();
      if (previous) Object.assign(state, previous);
      pending = null;
      continue;
    }
    if (fn === ops.transform) {
      const nums = asNumberList(args);
      if (nums.length >= 6) {
        state.ctm = mul(state.ctm, nums.slice(0, 6) as Mat);
      }
      continue;
    }
    if (fn === ops.setFillRGBColor) {
      const rgb = normalizeRgb(asNumberList(args));
      if (rgb) state.fill = rgb;
      continue;
    }
    if (fn === ops.setStrokeRGBColor) {
      const rgb = normalizeRgb(asNumberList(args));
      if (rgb) state.stroke = rgb;
      continue;
    }
    if (fn === ops.setFillGray) {
      const [gray] = asNumberList(args);
      if (gray != null) state.fill = grayToRgb(gray);
      continue;
    }
    if (fn === ops.setStrokeGray) {
      const [gray] = asNumberList(args);
      if (gray != null) state.stroke = grayToRgb(gray);
      continue;
    }
    if (fn === ops.setFillCMYKColor) {
      const [c, m, y, k] = asNumberList(args);
      if (k != null) state.fill = cmykToRgb(c, m, y, k);
      continue;
    }
    if (fn === ops.setStrokeCMYKColor) {
      const [c, m, y, k] = asNumberList(args);
      if (k != null) state.stroke = cmykToRgb(c, m, y, k);
      continue;
    }
    if (fn === ops.setGState) {
      applyGState(state, args);
      continue;
    }
    if (fn === ops.setFillTransparent) {
      state.fillOpacity = 0;
      continue;
    }
    if (fn === ops.setStrokeTransparent) {
      state.strokeOpacity = 0;
      continue;
    }
    if (fn === ops.beginText) {
      state.textMatrix = [...IDENTITY];
      state.lineMatrix = [...IDENTITY];
      continue;
    }
    if (fn === ops.setFont) {
      const record = Array.isArray(args) ? args[1] : undefined;
      const size = typeof record === "number" ? record : Number(record);
      if (Number.isFinite(size) && size > 0) state.fontSize = size;
      continue;
    }
    if (fn === ops.setTextRenderingMode) {
      const [mode] = asNumberList(args);
      if (mode != null) state.textRenderingMode = mode;
      continue;
    }
    if (fn === ops.setTextMatrix) {
      const nums = asNumberList(args);
      if (nums.length >= 6) {
        state.textMatrix = nums.slice(0, 6) as Mat;
        state.lineMatrix = nums.slice(0, 6) as Mat;
      }
      continue;
    }
    if (fn === ops.setHScale) {
      const [scale] = asNumberList(args);
      if (scale != null && scale > 0) state.hScale = scale;
      continue;
    }
    if (fn === ops.setLeading) {
      const [leading] = asNumberList(args);
      if (leading != null) state.leading = leading;
      continue;
    }
    if (fn === ops.moveText || fn === ops.setLeadingMoveText) {
      const [tx, ty] = asNumberList(args);
      if (fn === ops.setLeadingMoveText && ty != null) state.leading = -ty;
      const shift: Mat = [1, 0, 0, 1, tx ?? 0, ty ?? 0];
      const next = mul(shift, state.lineMatrix);
      state.lineMatrix = next;
      state.textMatrix = [...next];
      continue;
    }
    if (fn === ops.nextLine) {
      const shift: Mat = [1, 0, 0, 1, 0, -state.leading];
      const next = mul(shift, state.lineMatrix);
      state.lineMatrix = next;
      state.textMatrix = [...next];
      continue;
    }
    if (
      fn === ops.showText ||
      fn === ops.showSpacedText ||
      fn === ops.nextLineShowText ||
      fn === ops.nextLineSetSpacingShowText
    ) {
      if (fn === ops.nextLineShowText || fn === ops.nextLineSetSpacingShowText) {
        const shift: Mat = [1, 0, 0, 1, 0, -state.leading];
        const next = mul(shift, state.lineMatrix);
        state.lineMatrix = next;
        state.textMatrix = [...next];
      }
      show(args, index);
      continue;
    }
    if (fn === ops.constructPath) {
      const box = readPathBBox(args);
      if (box && box.w > 0 && box.h > 0) pending = box;
      continue;
    }
    if (fn === ops.rectangle) {
      const [x, y, w, h] = asNumberList(args);
      if (w != null && h != null) pending = { x: x ?? 0, y: y ?? 0, w, h };
      continue;
    }
    if (
      fn === ops.fill ||
      fn === ops.eoFill ||
      fn === ops.fillStroke ||
      fn === ops.eoFillStroke ||
      fn === ops.closeFillStroke ||
      fn === ops.closeEOFillStroke
    ) {
      if (pending) {
        paints.push({
          rect: transformRect(pending, state.ctm),
          opacity: state.fillOpacity,
          order: index,
        });
      }
      pending = null;
      continue;
    }
    if (
      fn === ops.paintImageXObject ||
      fn === ops.paintJpegXObject ||
      fn === ops.paintInlineImageXObject ||
      fn === ops.paintImageXObjectRepeat ||
      fn === ops.paintImageMaskXObject
    ) {
      paints.push({
        rect: transformRect({ x: 0, y: 0, w: 1, h: 1 }, state.ctm),
        opacity: state.fillOpacity,
        order: index,
      });
      continue;
    }
    if (fn === ops.endPath) pending = null;
  }

  const pageArea = Math.max(pageBox.w * pageBox.h, 1);
  for (const draft of drafts) {
    const textRect = { x: draft.x, y: draft.y, w: draft.width, h: draft.height };
    const textArea = Math.max(textRect.w * textRect.h, 1);
    for (const paint of paints) {
      if (paint.order <= draft.order) continue;
      if (paint.opacity < 0.85) continue;
      if (paint.rect.h < 2.5 || paint.rect.w < 2.5) continue;
      if (paint.rect.w * paint.rect.h > pageArea * 0.85) continue;
      const overlap = intersectionArea(textRect, paint.rect) / textArea;
      if (overlap >= 0.55) {
        draft.coverKind = "shape";
        break;
      }
    }
  }

  const annotations = await page.getAnnotations({ intent: "display" });
  annotations.forEach((annotation, annotationIndex) => {
    const contentsObj = annotation.contentsObj as { str?: string } | undefined;
    const contents =
      typeof annotation.contents === "string" && annotation.contents
        ? annotation.contents
        : contentsObj?.str;
    const text = typeof contents === "string" ? contents.trim() : "";
    if (!text) return;
    const subtype = typeof annotation.subtype === "string" ? annotation.subtype : "note";
    drafts.push({
      order: 100000 + annotationIndex,
      text,
      source: "annotation",
      location: `Page ${pageNumber}, ${subtype} annotation`,
      page: pageNumber,
      blockId: `annot-${pageNumber}-${annotationIndex}`,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });

  return drafts;
}

function spacers(drafts: Draft[]) {
  let previous: Draft | undefined;
  for (const draft of drafts) {
    if (draft.source !== "body") {
      draft.spacerBefore = "";
      continue;
    }
    if (!previous || previous.page !== draft.page) {
      draft.spacerBefore = previous ? "\n" : "";
    } else if (previous.blockId === draft.blockId) {
      const gap = draft.x - (previous.x + previous.width);
      draft.spacerBefore = gap > Math.max(1.5, (draft.fontSizePt ?? 12) * 0.18) ? " " : "";
    } else {
      draft.spacerBefore = "\n";
    }
    previous = draft;
  }
}

async function openPdf(data: Uint8Array): Promise<PdfDocument> {
  const pdfjs = await loadPdfjs();
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  }

  const task = pdfjs.getDocument({
    data: data.slice(),
    disableWorker: typeof window === "undefined",
    isEvalSupported: false,
    verbosity: 0,
    standardFontDataUrl: assetUrl(
      typeof window === "undefined"
        ? "node_modules/pdfjs-dist/standard_fonts/"
        : "/pdfjs/standard_fonts/",
    ),
    cMapUrl: assetUrl(
      typeof window === "undefined" ? "node_modules/pdfjs-dist/cmaps/" : "/pdfjs/cmaps/",
    ),
    cMapPacked: true,
  });

  try {
    return await task.promise;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "PasswordException") {
      throw new ScanError("This PDF is password-protected. Remove the password and scan it again. The file still never leaves your browser.");
    }
    throw new ScanError("This PDF could not be opened. It may be damaged or not a real PDF.");
  }
}

function xmpEntries(metadata: PdfMetadataObject | null | undefined): Array<[string, unknown]> {
  if (!metadata?.getAll) return [];
  const all = metadata.getAll();
  if (all instanceof Map) return [...all.entries()];
  if (all && typeof all === "object") return Object.entries(all);
  return [];
}

export async function readPdfMetadata(data: Uint8Array, fileName: string): Promise<PdfMetadataReport> {
  const pdf = await openPdf(data);
  try {
    const metadata = await pdf.getMetadata().catch(() => ({
      info: {} as Record<string, unknown>,
      metadata: null,
    }));
    const fields = buildMetadataFields(
      (metadata.info ?? {}) as Record<string, unknown>,
      xmpEntries(metadata.metadata),
      metadata.metadata?.getRaw?.() ?? null,
    );
    return { fileName, pageCount: pdf.numPages, fields };
  } finally {
    await pdf.destroy().catch(() => undefined);
  }
}

export async function extractPdf(data: Uint8Array, fileName: string): Promise<ExtractedDocument> {
  const pdfjs = await loadPdfjs();
  const pdf = await openPdf(data);
  try {
    const runs: TextRun[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const drafts = await extractPage(pdfjs, page, pageNumber);
      spacers(drafts);
      for (const draft of drafts) {
        runs.push({
          text: draft.text,
          source: draft.source,
          location: draft.location,
          page: draft.page,
          color: draft.color,
          background: draft.background,
          opacity: draft.opacity,
          fontSizePt: draft.fontSizePt,
          renderMode: draft.renderMode,
          hiddenFormatting: draft.hiddenFormatting,
          offPage: draft.offPage,
          coverKind: draft.coverKind,
          blockId: draft.blockId,
          spacerBefore: draft.spacerBefore,
        });
      }
    }

    const metadata = await pdf.getMetadata().catch(() => ({ info: {} as Record<string, unknown> }));
    const info = (metadata.info ?? {}) as Record<string, unknown>;
    for (const key of ["Title", "Author", "Subject", "Keywords"] as const) {
      const value = info[key];
      if (typeof value !== "string" || !value.trim()) continue;
      runs.push({
        text: value.trim(),
        source: "metadata",
        location: `Document metadata (${key.toLowerCase()})`,
        spacerBefore: "",
      });
    }

    return { fileName, fileType: "pdf", pageCount: pdf.numPages, runs };
  } finally {
    await pdf.destroy().catch(() => undefined);
  }
}
