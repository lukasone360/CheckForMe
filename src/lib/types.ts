export type RGB = [number, number, number];

export type Severity = "high" | "medium" | "low";

export type Verdict = "clean" | "suspicious" | "traps_found";

export type FileType = "pdf" | "docx" | "text";

/** Where a span of text lives in the file. */
export type SourceKind =
  | "body"
  | "header"
  | "footer"
  | "comment"
  | "footnote"
  | "endnote"
  | "metadata"
  | "alt"
  | "form"
  | "textbox"
  | "annotation"
  | "deleted";

export type FindingType =
  | "white-text"
  | "low-contrast"
  | "tiny-font"
  | "small-font"
  | "transparent"
  | "invisible-render"
  | "off-page"
  | "covered"
  | "hidden-formatting"
  | "zero-width"
  | "bidi"
  | "homoglyph"
  | "prompt-injection"
  | "comment"
  | "metadata"
  | "alt-text"
  | "form-field"
  | "tracked-change";

export type TextRun = {
  text: string;
  source: SourceKind;
  location: string;
  page?: number;
  /** Painted color, channels 0–1. Omitted for plain text. */
  color?: RGB;
  /** Surface behind the text. White when a color is known and no fill is set. */
  background?: RGB;
  /** Opacity of the painted text, 0–1. */
  opacity?: number;
  fontSizePt?: number;
  /** PDF Tr operator. Modes 3 and 7 paint nothing. */
  renderMode?: number;
  /** Word hidden/vanish formatting, when set. */
  hiddenFormatting?: string;
  offPage?: boolean;
  /** "shape" = painted over later; "behind" = Word behind-document text box. */
  coverKind?: "shape" | "behind";
  /** Joins with neighboring runs on the same line or paragraph. */
  blockId?: string;
  /** Inserted before this run when rebuilding text. */
  spacerBefore?: "" | " " | "\n";
};

export type Finding = {
  id: string;
  type: FindingType;
  severity: Severity;
  title: string;
  description: string;
  /** Exact excerpt from the file. */
  text: string;
  location: string;
  page?: number;
};

export type TranscriptSegment = {
  text: string;
  kind: "plain" | "hidden" | "injection";
};

export type ScanResult = {
  verdict: Verdict;
  verdictTitle: string;
  verdictDetail: string;
  findings: Finding[];
  /** Visible wording with concealed runs, invisible characters, and high-confidence trap sentences removed. */
  cleanText: string;
  segments: TranscriptSegment[];
  fileName: string;
  fileType: FileType;
  pageCount?: number;
};

export type ExtractedDocument = {
  fileName: string;
  fileType: FileType;
  pageCount?: number;
  runs: TextRun[];
};

export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}
