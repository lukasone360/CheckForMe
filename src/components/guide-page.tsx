import type { ReactNode } from "react";
import { AdSlot } from "./ad-slot";
import { FaqList } from "./faq-list";
import { ScanApp } from "./scan-app";
import { SiteShell } from "./site-shell";
import type { FaqItem } from "@/lib/faq";

export function GuidePage({
  kicker,
  title,
  lede,
  children,
  faq,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
  faq: FaqItem[];
}) {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 pt-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-dark">{kicker}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{lede}</p>
        <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#243246]">{children}</div>
      </article>
      <ScanApp />
      <FaqList items={faq} title="Related questions" />
      <AdSlot slot="guide-bottom" />
    </SiteShell>
  );
}
