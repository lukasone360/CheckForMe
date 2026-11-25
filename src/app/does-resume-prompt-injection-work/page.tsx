import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { resumeInjectionGuide } from "@/content/guides/resume-injection";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(resumeInjectionGuide);

export default function Page() {
  return <GuideView guide={resumeInjectionGuide} />;
}
