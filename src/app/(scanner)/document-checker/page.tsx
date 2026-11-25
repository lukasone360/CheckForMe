import { FaqList } from "@/components/faq-list";
import { ModeArticle } from "@/components/mode-article";
import { ScanApp } from "@/components/scan-app";
import { SiteShell } from "@/components/site-shell";
import { modeArticles } from "@/content/mode-copy";
import { getMode } from "@/lib/modes";
import { toolMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
import { breadcrumbLd, faqPageLd, jsonLd } from "@/lib/structured-data";

const mode = getMode("document");

export const metadata = toolMetadata({
  title: mode.title,
  description: mode.description,
  href: mode.href,
});

export default function DocumentCheckerPage() {
  const pageUrl = `${site.url}${mode.href}`;
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPageLd(modeArticles.document.faq)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Home", item: site.url },
              { name: mode.crumb, item: pageUrl },
            ]),
          ),
        }}
      />
      <ScanApp hero showModes mode="document" />
      <ModeArticle modeId="document" />
      <FaqList items={modeArticles.document.faq} title="FAQ" />
    </SiteShell>
  );
}
