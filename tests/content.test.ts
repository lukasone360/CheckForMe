import { describe, expect, it } from "vitest";
import { guideCatalog } from "@/content/guide-catalog";
import { scanTopics } from "@/content/scan-topics";
import { assignmentGuide } from "@/content/guides/assignment";
import { canvasGuide } from "@/content/guides/canvas";
import { invisibleGuide } from "@/content/guides/invisible";
import { resumeInjectionGuide } from "@/content/guides/resume-injection";
import { resumeGuide } from "@/content/guides/resume";
import { trojanGuide } from "@/content/guides/trojan";
import { turnitinGuide } from "@/content/guides/turnitin";
import { whiteResumeGuide } from "@/content/guides/white-resume";
import { whiteTextGuide } from "@/content/guides/white-text";
import { wordGuide } from "@/content/guides/word";
import { guideBodyWordCount, guideFaqWordCount, countWords } from "@/content/guides/words";
import { metadataPage } from "@/content/metadata-page";
import { modeArticles } from "@/content/mode-copy";
import { adsenseClient, adsenseSlot, adsTxtBody } from "@/lib/ads";
import {
  CONTENT_UPDATED,
  DEFAULT_CONTACT_EMAIL,
  contactEmail,
  contactEmailLabel,
  contentUpdatedLabel,
  siteUrl,
} from "@/lib/site";
import sitemap from "@/app/sitemap";
import { GET as adsTxt } from "@/app/ads.txt/route";

const guides = [
  assignmentGuide,
  whiteTextGuide,
  trojanGuide,
  canvasGuide,
  wordGuide,
  invisibleGuide,
  resumeGuide,
  resumeInjectionGuide,
  whiteResumeGuide,
  turnitinGuide,
];

const longForm = new Set([
  resumeInjectionGuide.href,
  whiteResumeGuide.href,
  turnitinGuide.href,
]);

const expanded = new Set([
  assignmentGuide.href,
  whiteTextGuide.href,
  trojanGuide.href,
]);

describe("guides", () => {
  it("keeps article length in range and includes five or six FAQs", () => {
    const counts = guides.map((guide) => ({
      href: guide.href,
      body: guideBodyWordCount(guide),
      faq: guideFaqWordCount(guide),
      faqs: guide.faq.length,
    }));
    for (const count of counts) {
      const total = count.body + count.faq;
      expect(count.faqs, count.href).toBeGreaterThanOrEqual(5);
      expect(count.faqs, count.href).toBeLessThanOrEqual(6);
      expect(count.body, `${count.href} body ${count.body}`).toBeGreaterThanOrEqual(800);
      expect(total, `${count.href} total ${total} (body ${count.body}, faq ${count.faq})`).toBeGreaterThanOrEqual(800);
      if (expanded.has(count.href)) {
        expect(total, `${count.href} total ${total} (body ${count.body}, faq ${count.faq})`).toBeLessThanOrEqual(1200);
      }
      if (longForm.has(count.href)) {
        expect(count.body, `${count.href} body ${count.body}`).toBeLessThanOrEqual(1500);
        expect(total, `${count.href} total ${total}`).toBeLessThanOrEqual(1500);
      }
    }
  });

  it("keeps the white-text guide aimed at finding hidden PDF text", () => {
    expect(whiteTextGuide.title).toBe("Find Hidden Text in a PDF: White Text, Tiny Fonts & More");
    expect(whiteTextGuide.description.toLowerCase()).toContain("find hidden text in a pdf");
    expect(whiteTextGuide.lede.toLowerCase()).toContain("find hidden text in a pdf");
  });

  it("links every résumé guide to the résumé checker", () => {
    for (const guide of [resumeGuide, resumeInjectionGuide, whiteResumeGuide]) {
      expect(JSON.stringify(guide), guide.href).toContain("/resume-checker");
    }
    expect(resumeGuide.cta?.href).toBe("/resume-checker");
  });

  it("keeps mode pages and the metadata explainer in range", () => {
    for (const id of ["resume", "document"] as const) {
      const article = modeArticles[id];
      const parts = article.sections.flatMap((section) => [section.heading, ...section.paragraphs]);
      const words = countWords(parts.join("\n"));
      expect(words, `${id} ${words}`).toBeGreaterThanOrEqual(300);
      expect(words, `${id} ${words}`).toBeLessThanOrEqual(500);
      expect(article.faq.length).toBeGreaterThanOrEqual(5);
    }
    const metaParts = [metadataPage.lede, ...metadataPage.sections.flatMap((section) => [section.heading, ...section.paragraphs])];
    const metaWords = countWords(metaParts.join("\n"));
    expect(metaWords, `metadata body ${metaWords}`).toBeGreaterThanOrEqual(800);
    expect(metaWords, `metadata body ${metaWords}`).toBeLessThanOrEqual(1500);
  });

  it("lists every guide in the catalog, sitemap, and homepage topics", () => {
    expect(guides.map((guide) => guide.href).sort()).toEqual(guideCatalog.map((item) => item.href).sort());
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    for (const guide of guides) {
      expect(urls, guide.href).toContain(guide.href);
      expect(scanTopics.some((topic) => topic.href === guide.href), guide.href).toBe(true);
    }
    expect(urls).toEqual(
      expect.arrayContaining(["/", "/about", "/contact", "/privacy", "/terms", "/faq", "/resume-checker", "/document-checker", "/pdf-metadata-checker"]),
    );
  });
});

describe("site helpers", () => {
  it("falls back to the public site URL and hello@checkforme.org", () => {
    const previousUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const previousEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    expect(siteUrl()).toBe("https://checkforme.vercel.app");
    expect(contactEmail()).toBe("hello@checkforme.org");
    expect(contactEmailLabel()).toBe(DEFAULT_CONTACT_EMAIL);
    expect(DEFAULT_CONTACT_EMAIL).toBe("hello@checkforme.org");

    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "  hi@example.com  ";
    expect(siteUrl()).toBe("https://example.com");
    expect(contactEmail()).toBe("hi@example.com");
    expect(contactEmailLabel()).toBe("hi@example.com");

    if (previousUrl == null) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousUrl;
    if (previousEmail == null) delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    else process.env.NEXT_PUBLIC_CONTACT_EMAIL = previousEmail;
  });

  it("publishes a single updated date", () => {
    expect(CONTENT_UPDATED).toBe("2026-11-26");
    expect(contentUpdatedLabel()).toBe("November 26, 2026");
    const dates = sitemap().map((entry) => entry.lastModified);
    expect(dates.every((date) => date instanceof Date && date.toISOString().startsWith("2026-11-26"))).toBe(true);
  });
});

describe("ad configuration", () => {
  it("accepts only numeric slot ids and builds ads.txt from the client id", async () => {
    const previousResults = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS;
    const previousGuide = process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE;
    delete process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS;
    delete process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE;
    expect(adsenseSlot("results")).toBeUndefined();
    expect(adsenseSlot("guide")).toBeUndefined();
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS = "  ";
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE = "slot-1";
    expect(adsenseSlot("results")).toBeUndefined();
    expect(adsenseSlot("guide")).toBeUndefined();
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS = "1234567890";
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE = "0987654321";
    expect(adsenseSlot("results")).toBe("1234567890");
    expect(adsenseSlot("guide")).toBe("0987654321");

    expect(adsTxtBody(undefined)).toBeUndefined();
    expect(adsTxtBody("ca-pub-123")).toBe("google.com, pub-123, DIRECT, f08c47fec0942fa0\n");
    expect(adsenseClient()).toBeUndefined();

    const previousClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    const missing = adsTxt();
    expect(missing.status).toBe(404);
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = "ca-pub-999";
    const found = adsTxt();
    expect(found.status).toBe(200);
    expect(await found.text()).toBe("google.com, pub-999, DIRECT, f08c47fec0942fa0\n");
    if (previousClient == null) delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    else process.env.NEXT_PUBLIC_ADSENSE_CLIENT = previousClient;

    if (previousResults == null) delete process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS;
    else process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS = previousResults;
    if (previousGuide == null) delete process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE;
    else process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE = previousGuide;
  });
});
