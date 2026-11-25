import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { canvasGuide } from "@/content/guides/canvas";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(canvasGuide);

export default function Page() {
  return <GuideView guide={canvasGuide} />;
}
