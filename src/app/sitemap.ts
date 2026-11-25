import type { MetadataRoute } from "next";
import { guideCatalog } from "@/content/guide-catalog";
import { CONTENT_UPDATED, site } from "@/lib/site";

const paths = [
  "/",
  "/resume-checker",
  "/document-checker",
  "/pdf-metadata-checker",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  ...guideCatalog.map((guide) => guide.href),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_UPDATED);
  return paths.map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/resume-checker" || path === "/document-checker" || path === "/pdf-metadata-checker" ? 0.8 : 0.7,
  }));
}
