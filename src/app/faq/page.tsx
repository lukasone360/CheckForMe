import type { Metadata } from "next";
import { FaqList } from "@/components/faq-list";
import { SiteShell } from "@/components/site-shell";
import { faqItems } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about local scanning, file types, hidden AI traps, and what a clean result means.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <SiteShell>
      <FaqList items={faqItems} title="Frequently asked questions" />
    </SiteShell>
  );
}
