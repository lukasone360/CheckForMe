import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { resumeGuide } from "@/content/guides/resume";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(resumeGuide);

export default function Page() {
  return <GuideView guide={resumeGuide} />;
}
