import type { FaqItem } from "@/lib/faq";

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  /** Numbered manual steps, rendered as an ordered list. */
  steps?: string[];
};

export type GuideContent = {
  href: string;
  label: string;
  kicker: string;
  title: string;
  description: string;
  lede: string;
  sections: GuideSection[];
  faq: FaqItem[];
  /** Paste tool embedded in the article. */
  tool?: "invisible-characters";
};
