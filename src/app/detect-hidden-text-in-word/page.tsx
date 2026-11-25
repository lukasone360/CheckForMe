import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { wordGuide } from "@/content/guides/word";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(wordGuide);

export default function Page() {
  return <GuideView guide={wordGuide} />;
}
