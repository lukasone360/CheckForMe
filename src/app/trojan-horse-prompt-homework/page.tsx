import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { trojanGuide } from "@/content/guides/trojan";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(trojanGuide);

export default function Page() {
  return <GuideView guide={trojanGuide} />;
}
