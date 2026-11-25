import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { assignmentGuide } from "@/content/guides/assignment";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(assignmentGuide);

export default function Page() {
  return <GuideView guide={assignmentGuide} />;
}
