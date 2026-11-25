import type { Metadata } from "next";
import { GuideView } from "@/components/guide-view";
import { turnitinGuide } from "@/content/guides/turnitin";
import { guideMetadata } from "@/lib/guide-metadata";

export const metadata: Metadata = guideMetadata(turnitinGuide);

export default function Page() {
  return <GuideView guide={turnitinGuide} />;
}
