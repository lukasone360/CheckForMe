import type { Metadata } from "next";
import { ContactEmail } from "@/components/contact-email";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the people who run CheckForMe.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-dark">Contact</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Contact</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          CheckForMe is run by Pixie Ventures. Questions about the site, the privacy policy, or an accessibility problem go to the address below.
        </p>
        <div className="mt-8 rounded-2xl border border-line bg-[#f7f9fc] px-5 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Email</h2>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-navy">
            <ContactEmail />
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The scanner still does not accept files by email. Do not attach an assignment or a résumé. Describe the problem, and leave the document on your own computer.
          </p>
        </div>
        <div className="mt-8 space-y-4 text-[15px] leading-7 text-[#243246]">
          <h2 className="text-xl font-bold text-navy">What we can help with</h2>
          <p>
            A page that fails to load, a file type the scanner refuses, a result that looks wrong on a document you can describe without sending it, and privacy questions. We cannot see the file you scanned. If you want a second opinion on a specific sentence, quote that sentence in the email. Do not send the whole assignment.
          </p>
          <h2 className="text-xl font-bold text-navy">What email will not do</h2>
          <p>
            Emailing does not submit homework, appeal a grade, or rewrite a résumé. The site does not log into Canvas, and it does not contact an instructor or an employer for you. Course rules and hiring decisions stay with the people who set them.
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
