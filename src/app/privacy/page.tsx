import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How CheckForMe handles assignment files, site logs, and advertising cookies.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const contact = site.contactEmail || "the contact address published for this deployment";
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-ink">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Privacy policy</h1>
        <p className="mt-2 text-muted">Last updated April 1, 2026.</p>
        <div className="mt-8 space-y-4 text-[15px] leading-7 text-[#243246]">
          <p>
            CheckForMe is a file-inspection page. This policy explains what the site can see and what it cannot.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Assignment files</h2>
          <p>
            When you drop a PDF, DOCX, or paste text, the scan runs in your browser. The file is not uploaded, not written to a database, and not attached to an account. CheckForMe has no accounts. Closing the tab discards the document from the page.
          </p>
          <p>
            The hosting provider can log normal web requests: the URL, time, IP address, and user agent. Those logs do not contain the assignment, because the assignment is never sent as part of the request.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Cookies and advertising</h2>
          <p>
            The scan itself does not set a tracking cookie. If the site operator sets the ad client id (<code>NEXT_PUBLIC_ADSENSE_CLIENT</code>), Google AdSense may load and place cookies to measure and personalize ads. Until that id is set, the ad slots render nothing and the AdSense script is not included. Google’s own policy describes how those cookies work.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">What we do not collect</h2>
          <p>
            We do not ask for your name, school, or email to run a scan. We do not sell assignment text. We do not use the contents of a scan to train a model.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Children</h2>
          <p>
            The tool is written for students checking school files. It does not require an account and is not directed at collecting personal information from children.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Contact</h2>
          <p>
            Privacy questions go to {contact}. Replace the published address before you apply for an ad network if this deployment still shows a placeholder.
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
