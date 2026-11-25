import type { GuideContent } from "./types";

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Article prose: lede, headings, paragraphs, and manual steps. FAQs are counted separately. */
export function guideBodyWordCount(guide: GuideContent): number {
  const parts = [guide.lede];
  for (const section of guide.sections) {
    parts.push(section.heading, ...section.paragraphs, ...(section.steps ?? []));
  }
  return countWords(parts.join("\n"));
}

export function guideFaqWordCount(guide: GuideContent): number {
  const parts = guide.faq.flatMap((item) => [item.question, item.answer]);
  return countWords(parts.join("\n"));
}
