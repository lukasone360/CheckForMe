import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { whiteResumeGuide } from "@/content/guides/white-resume";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(whiteResumeGuide);

export default function Page() {
  return <GuideView guide={whiteResumeGuide} />;
}
