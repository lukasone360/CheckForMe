import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { PdfMetadataTool } from "@/components/pdf-metadata-tool";
import { RichText } from "@/components/rich-text";
import { SiteShell } from "@/components/site-shell";
import { guideCatalog } from "@/content/guide-catalog";
import { metadataPage } from "@/content/metadata-page";
import { toolMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
import { breadcrumbLd, faqPageLd, jsonLd } from "@/lib/structured-data";

export const metadata = toolMetadata({
  title: metadataPage.title,
  description: metadataPage.description,
  href: metadataPage.href,
});

export default function PdfMetadataPage() {
  const pageUrl = `${site.url}${metadataPage.href}`;
  const related = [
    { href: "/document-checker", label: "Document checker", summary: "Full local scan, with metadata and comments listed first." },
    { href: "/resume-checker", label: "Résumé checker", summary: "White text, tiny fonts, and prompt injection, listed first." },
    ...guideCatalog.filter((item) =>
      item.href === "/detect-white-text-in-pdf" || item.href === "/detect-hidden-text-in-word",
    ),
  ];

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPageLd(metadataPage.faq)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Home", item: site.url },
              { name: metadataPage.title, item: pageUrl },
            ]),
          ),
        }}
      />
      <article className="mx-auto max-w-3xl px-4 pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-navy">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink">{metadataPage.label}</li>
          </ol>
        </nav>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-green-dark">{metadataPage.kicker}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{metadataPage.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          <RichText text={metadataPage.lede} />
        </p>
        <PdfMetadataTool />
        <div className="mt-12 space-y-8 text-[15px] leading-7 text-[#243246]">
          {metadataPage.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-navy">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="mt-3">
                  <RichText text={paragraph} />
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
      <FaqList items={metadataPage.faq} title="Questions" />
      <section className="mx-auto max-w-3xl px-4 pb-4" aria-label="Related guides">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy">Related</h2>
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
    </SiteShell>
  );
}
