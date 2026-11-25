import { AdSlot } from "@/components/ad-slot";
import { FaqList } from "@/components/faq-list";
import { HomeSections } from "@/components/home-sections";
import { ScanApp } from "@/components/scan-app";
import { SiteShell } from "@/components/site-shell";
import { faqItems } from "@/lib/faq";
import { site } from "@/lib/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <ScanApp hero />
      <HomeSections />
      <FaqList items={faqItems} title="FAQ" />
      <AdSlot slot="home-bottom" />
    </SiteShell>
  );
}
