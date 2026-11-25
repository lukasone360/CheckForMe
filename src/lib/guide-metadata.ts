import type { Metadata } from "next";
import type { GuideContent } from "@/content/guides/types";
import { siteUrl } from "@/lib/site";

export function guideMetadata(guide: Pick<GuideContent, "title" | "description" | "href">): Metadata {
  const url = `${siteUrl()}${guide.href}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: guide.href },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
    },
  };
}
