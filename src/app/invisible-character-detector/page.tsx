import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { invisibleGuide } from "@/content/guides/invisible";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(invisibleGuide);

export default function Page() {
  return <GuideView guide={invisibleGuide} />;
}
