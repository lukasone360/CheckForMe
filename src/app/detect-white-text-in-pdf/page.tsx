import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { whiteTextGuide } from "@/content/guides/white-text";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(whiteTextGuide);

export default function Page() {
  return <GuideView guide={whiteTextGuide} />;
}
