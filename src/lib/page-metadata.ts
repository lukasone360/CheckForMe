import type { Metadata } from "next";
import { siteUrl } from "./site";

export function toolMetadata(page: { title: string; description: string; href: string; absoluteTitle?: boolean }): Metadata {
  const url = `${siteUrl()}${page.href === "/" ? "" : page.href}`;
  return {
    title: page.absoluteTitle ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: page.href },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}
