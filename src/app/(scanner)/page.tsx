import { FaqList } from "@/components/faq-list";
import { HomeSections } from "@/components/home-sections";
import { ScanApp } from "@/components/scan-app";
import { SiteShell } from "@/components/site-shell";
import { faqItems } from "@/lib/faq";
import { getMode } from "@/lib/modes";
import { toolMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
import { breadcrumbLd, faqPageLd, jsonLd } from "@/lib/structured-data";

const mode = getMode("homework");

export const metadata = toolMetadata({
  title: mode.title,
  description: mode.description,
  href: mode.href,
  absoluteTitle: true,
});

export default function HomePage() {
  const faqLd = faqPageLd(faqItems);
  const crumbsLd = breadcrumbLd([{ name: "Home", item: site.url }]);
  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: site.name,
    url: site.url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: site.description,
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(appLd) }} />
      <ScanApp hero showModes mode="homework" />
      <HomeSections />
      <FaqList items={faqItems} title="FAQ" />
    </SiteShell>
  );
}
