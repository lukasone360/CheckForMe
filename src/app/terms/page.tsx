import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail } from "@/components/contact-email";
import { SiteShell } from "@/components/site-shell";
import { contentUpdatedLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using CheckForMe, a local assignment-file scanner.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Terms of use</h1>
        <p className="mt-2 text-sm text-muted">Last updated {contentUpdatedLabel()}.</p>
        <div className="mt-8 space-y-4 text-[15px] leading-7 text-[#243246]">
          <p>
            CheckForMe lets you inspect a file for concealed text and prompt-injection phrasing. By using the site you agree to these terms.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">What the tool is</h2>
          <p>
            The scan is informational. It reports signals it knows how to see. A “clean” verdict is not a promise that a file contains no hidden instruction, and a “traps found” verdict is not a legal or academic finding. The site does not write assignments and does not submit anything to a school.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Your files</h2>
          <p>
            You keep the rights to the files you scan. You are responsible for having the right to inspect them. Do not use the site to break into systems, steal credentials, or hide malware. The scanner is for reading documents you already have.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">No warranty</h2>
          <p>
            The site is provided as-is. Parsing can miss text in damaged files, unusual fonts, or pictures of text. We do not warrant that the result is complete, accurate, or fit for a particular course policy.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Limitation of liability</h2>
          <p>
            To the fullest extent the law allows, the operator is not liable for lost grades, missed deadlines, or decisions you make after reading a report. If a jurisdiction does not allow that limit, liability is limited to the amount you paid to use the site, which is zero while the tool is free.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Ads</h2>
          <p>
            CheckForMe is free because it&apos;s supported by ads. Ads may be served by third parties such as Google, who may use cookies to show ads based on your visits to this and other sites. See our{" "}
            <Link href="/privacy" className="font-semibold text-navy hover:underline">Privacy Policy</Link>{" "}
            for details and how to opt out. Third-party ad providers have their own terms and policies.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Changes</h2>
          <p>
            These terms can be updated by changing this page. Continued use after a change means you accept the new terms. Questions: <ContactEmail />.
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
