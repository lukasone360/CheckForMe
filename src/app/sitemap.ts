import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const paths = [
  "/",
  "/faq",
  "/privacy",
  "/terms",
  "/check-assignment-for-hidden-ai-prompt",
  "/detect-white-text-in-pdf",
  "/trojan-horse-prompt-homework",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-04-01");
  return paths.map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
