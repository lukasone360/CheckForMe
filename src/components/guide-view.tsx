import Link from "next/link";
import { guideCatalog } from "@/content/guide-catalog";
import type { GuideContent } from "@/content/guides/types";
import { breadcrumbLd, faqPageLd, jsonLd } from "@/lib/structured-data";
import { site } from "@/lib/site";
import { AdSlot } from "./ad-slot";
import { FaqList } from "./faq-list";
import { InvisibleCharacterTool } from "./invisible-character-tool";
import { RichText } from "./rich-text";
import { ScanApp } from "./scan-app";
import { ScanProvider } from "./scan-session";
import { SiteShell } from "./site-shell";

export function GuideView({ guide }: { guide: GuideContent }) {
  const pageUrl = `${site.url}${guide.href}`;
  const faqLd = faqPageLd(guide.faq);
  const crumbsLd = breadcrumbLd([
    { name: "Home", item: site.url },
    { name: guide.title, item: pageUrl },
  ]);
  const related = guideCatalog.filter((item) => item.href !== guide.href);

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbsLd) }} />
      <article className="mx-auto max-w-3xl px-4 pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-navy">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink">{guide.label}</li>
          </ol>
        </nav>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-green-dark">{guide.kicker}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{guide.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          <RichText text={guide.lede} />
        </p>
        {guide.cta ? (
          <aside className="mt-6 rounded-2xl border border-[#b7ebc9] bg-[#f3fbf6] px-5 py-5">
            <p className="text-sm leading-relaxed text-ink">
              <RichText text={guide.cta.text} />
            </p>
            <Link
              href={guide.cta.href}
              className="mt-4 inline-flex rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-deep"
            >
              {guide.cta.label}
            </Link>
          </aside>
        ) : null}
        <div className="mt-8 space-y-8 text-[15px] leading-7 text-[#243246]">
          {guide.sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-navy">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="mt-3">
                  <RichText text={paragraph} />
                </p>
              ))}
              {section.steps ? (
                <ol className="mt-3 list-decimal space-y-2 pl-5">
                  {section.steps.map((step) => (
                    <li key={step.slice(0, 48)}>
                      <RichText text={step} />
                    </li>
                  ))}
                </ol>
              ) : null}
              {guide.tool === "invisible-characters" && index === 1 ? <InvisibleCharacterTool /> : null}
            </section>
          ))}
        </div>
      </article>
      <ScanProvider>
        <ScanApp />
      </ScanProvider>
      <FaqList items={guide.faq} title="Questions" />
      <section className="mx-auto max-w-3xl px-4 pb-4" aria-label="Related guides">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy">Related guides</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block h-full rounded-xl border border-line bg-white px-4 py-3 hover:border-navy">
                <span className="text-sm font-semibold text-navy">{item.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{item.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <AdSlot placement="guide" />
    </SiteShell>
  );
}
