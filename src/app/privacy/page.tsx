import type { Metadata } from "next";
import { ContactEmail } from "@/components/contact-email";
import { SiteShell } from "@/components/site-shell";
import { contentUpdatedLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How CheckForMe handles assignment files, site logs, and advertising cookies.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-ink">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Privacy policy</h1>
        <p className="mt-2 text-muted">Last updated {contentUpdatedLabel()}.</p>
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
          <h2 className="pt-4 text-xl font-bold text-navy">Page views</h2>
          <p>
            CheckForMe loads Vercel Web Analytics to count page views. That measurement is cookie-free: it does not set a cookie, and it does not receive the assignment, résumé, or pasted text, because those never leave the browser. It records ordinary page-view data such as the path, referrer, and a coarse location derived from the IP address. Vercel’s own documentation describes the measurement.
          </p>
          <h2 className="pt-4 text-xl font-bold text-navy">Cookies and advertising</h2>
          <p>
            The scan itself does not set a tracking cookie. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this site or other sites. Google’s use of advertising cookies enables it and its partners to serve ads based on your visits to this site and other sites on the Internet. You can opt out of personalized ads in{" "}
            <a href="https://adssettings.google.com" className="font-semibold text-navy underline-offset-2 hover:underline">Google Ads Settings</a>{" "}
            (https://adssettings.google.com). You can also opt out of a third-party vendor’s use of cookies for personalized advertising at{" "}
            <a href="https://www.aboutads.info" className="font-semibold text-navy underline-offset-2 hover:underline">www.aboutads.info</a>.
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
            Privacy questions go to <ContactEmail />.
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
