import type { ExtractedDocument } from "../types";

export function extractPlainText(text: string, fileName: string): ExtractedDocument {
  const normalized = text.replace(/^\uFEFF/, "");
  return {
    fileName,
    fileType: "text",
    runs: normalized
      ? [
          {
            text: normalized,
            source: "body",
            location: "Pasted text",
            blockId: "paste",
            spacerBefore: "",
          },
        ]
      : [],
  };
}
