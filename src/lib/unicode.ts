/** Characters that take no visible space, or that reverse how text is displayed. */

const ZERO_WIDTH = new Set<number>([
  0x00ad, // soft hyphen
  0x034f, // combining grapheme joiner
  0x061c, // arabic letter mark
  0x180e, // mongolian vowel separator
  0x200b, // zero width space
  0x200c, // zero width non-joiner
  0x200d, // zero width joiner
  0x200e, // left-to-right mark
  0x200f, // right-to-left mark
  0x2060, // word joiner
  0x2061, // function application
  0x2062, // invisible times
  0x2063, // invisible separator
  0x2064, // invisible plus
  0xfeff, // zero width no-break space
]);

const BIDI_OVERRIDES = new Set<number>([
  0x202a, // LRE
  0x202b, // RLE
  0x202c, // PDF
  0x202d, // LRO
  0x202e, // RLO
  0x2066, // LRI
  0x2067, // RLI
  0x2068, // FSI
  0x2069, // PDI
  0x206a,
  0x206b,
  0x206c,
  0x206d,
  0x206e,
  0x206f,
]);

/** Cyrillic and Greek letters commonly swapped for Latin lookalikes. */
const CONFUSABLES = new Set<number>([
  0x0410, 0x0412, 0x0415, 0x041a, 0x041c, 0x041d, 0x041e, 0x0420, 0x0421, 0x0422,
  0x0425, 0x0430, 0x0435, 0x043e, 0x0440, 0x0441, 0x0443, 0x0445, 0x0455, 0x0456,
  0x0458, 0x04bb, 0x0391, 0x0392, 0x0395, 0x0397, 0x0399, 0x039a, 0x039c, 0x039d,
  0x039f, 0x03a1, 0x03a4, 0x03a7, 0x03bf, 0x03c1, 0x03b9,
]);

const LABELS: Record<number, string> = {
  0x00ad: "SHY",
  0x034f: "CGJ",
  0x061c: "ALM",
  0x180e: "MVS",
  0x200b: "ZWSP",
  0x200c: "ZWNJ",
  0x200d: "ZWJ",
  0x200e: "LRM",
  0x200f: "RLM",
  0x202a: "LRE",
  0x202b: "RLE",
  0x202c: "PDF",
  0x202d: "LRO",
  0x202e: "RLO",
  0x2060: "WJ",
  0x2061: "FA",
  0x2062: "IT",
  0x2063: "IS",
  0x2064: "IP",
  0x2066: "LRI",
  0x2067: "RLI",
  0x2068: "FSI",
  0x2069: "PDI",
  0xfeff: "BOM",
};

export type InvisibleHit = {
  index: number;
  code: number;
  char: string;
  label: string;
  kind: "zero-width" | "bidi";
  insideWord: boolean;
};

export type HomoglyphHit = {
  word: string;
  index: number;
};

function isTagChar(code: number): boolean {
  return code >= 0xe0000 && code <= 0xe007f;
}

export function isZeroWidth(code: number): boolean {
  return ZERO_WIDTH.has(code) || isTagChar(code);
}

export function isBidiOverride(code: number): boolean {
  return BIDI_OVERRIDES.has(code);
}

function isWordChar(code: number): boolean {
  return /\p{L}|\p{N}/u.test(String.fromCodePoint(code));
}

export function findInvisible(text: string): InvisibleHit[] {
  const hits: InvisibleHit[] = [];
  const codes: number[] = [];
  for (const ch of text) codes.push(ch.codePointAt(0) ?? 0);

  let index = 0;
  let unit = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const kind = isBidiOverride(code)
      ? "bidi"
      : isZeroWidth(code)
        ? "zero-width"
        : null;
    if (kind) {
      const prev = index > 0 ? codes[index - 1] : 0;
      const next = index + 1 < codes.length ? codes[index + 1] : 0;
      hits.push({
        index: unit,
        code,
        char: ch,
        label: LABELS[code] ?? (isTagChar(code) ? "TAG" : `U+${code.toString(16).toUpperCase()}`),
        kind,
        insideWord: isWordChar(prev) && isWordChar(next),
      });
    }
    unit += ch.length;
    index += 1;
  }
  return hits;
}

export function findHomoglyphs(text: string): HomoglyphHit[] {
  const hits: HomoglyphHit[] = [];
  const word = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = word.exec(text))) {
    const token = match[0];
    let latin = false;
    let confusable = false;
    for (const ch of token) {
      const code = ch.codePointAt(0) ?? 0;
      if (CONFUSABLES.has(code)) confusable = true;
      if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
        latin = true;
      }
    }
    if (latin && confusable) {
      hits.push({ word: token, index: match.index });
    }
  }
  return hits;
}

export function stripInvisible(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (isZeroWidth(code) || isBidiOverride(code)) continue;
    out += ch;
  }
  return out;
}

/** Show invisible characters as readable tokens so a finding can be quoted. */
export function visualizeInvisible(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (isZeroWidth(code) || isBidiOverride(code)) {
      const label =
        LABELS[code] ?? (isTagChar(code) ? "TAG" : `U+${code.toString(16).toUpperCase()}`);
      out += `⟦${label}⟧`;
    } else {
      out += ch;
    }
  }
  return out;
}
