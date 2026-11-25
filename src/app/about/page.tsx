import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { guideCatalog } from "@/content/guide-catalog";

export const metadata: Metadata = {
  title: "About",
  description:
    "CheckForMe is run by Pixie Ventures. Scans happen in your browser. Files are not uploaded or stored.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-dark">About</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">About CheckForMe</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          CheckForMe is a single-purpose scanner for hidden text and prompt traps in files you already have. Pixie Ventures runs the site. Pixie Ventures is the brand behind it. The site does not ask you to create an account, and it does not publish personal names of operators.
        </p>
        <div className="mt-8 space-y-4 text-[15px] leading-7 text-[#243246]">
          <h2 className="pt-2 text-xl font-bold text-navy">Where to check a file</h2>
          <p>
            The <Link href="/" className="font-semibold text-navy hover:underline">homework check</Link> stays the student-focused scanner. The <Link href="/resume-checker" className="font-semibold text-navy hover:underline">résumé checker</Link> lists white text, tiny type, and prompt injection first. The <Link href="/document-checker" className="font-semibold text-navy hover:underline">document checker</Link> raises metadata and comments. The <Link href="/pdf-metadata-checker" className="font-semibold text-navy hover:underline">PDF metadata checker</Link> lists every Info field and any XMP packet. Switching modes keeps the file in the tab. A guide below explains one hiding place in more detail.
          </p>

          <h2 className="pt-4 text-xl font-bold text-navy">Scanning stays in the browser</h2>
          <p>
            When you drop a PDF, a Word .docx, or a pasted paragraph, the page reads it with code that runs on your device. There is no upload endpoint and no file database. The assignment, résumé, or paste is not sent to CheckForMe, not written to a server, and not kept after you close the tab. The hosting provider can still see ordinary request logs, such as the page URL and IP address. Those logs do not contain the document, because the document is never part of a request.
          </p>
          <p>
            The same rule covers the sample file and the invisible-character box. The sample is a file this site already published. Loading it does not upload anything of yours. The character check uses the same detection functions as a file scan, on the text in the box, and stops there.
          </p>

          <h2 className="pt-4 text-xl font-bold text-navy">What a scan looks for</h2>
          <p>
            The checks cover white and low-contrast text, transparent text, PDF text that is not painted, tiny fonts, text off the page or covered by a shape, Word hidden formatting, comments, document properties, long or injected image alt text, form-field text, tracked-change deletions, zero-width characters, bidirectional overrides, letters swapped in from another alphabet, and prompt-injection phrases. A finding quotes the text and says where it was stored. The verdict is clean, suspicious, or traps found.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {guideCatalog.map((guide) => (
              <li key={guide.href}>
                <Link href={guide.href} className="font-semibold text-navy hover:underline">{guide.label}</Link>
                <span className="text-muted"> — {guide.summary}</span>
              </li>
            ))}
          </ul>

          <h2 className="pt-4 text-xl font-bold text-navy">Limits</h2>
          <p>
            A clean verdict means these checks did not fire. It is not a guarantee that a file contains no hidden instruction, and it is not a statement about your course or employer’s rules. Text flattened into a picture is not read. A sentence that avoids every stock phrase can still be an instruction. Damaged files can hide a span the parser skips. Older .doc files, slides, and spreadsheets need to be exported to PDF or DOCX first. Links are not fetched. You download the file, then drop it here.
          </p>
          <p>
            CheckForMe does not write assignments or résumés, and it does not tell you how to evade an academic integrity rule, a plagiarism checker, or a hiring screen. The point of a finding is that you can see the extra text before you paste the file somewhere else. If a course forbids AI tools, a clean file does not change that. If a résumé contains a hidden keyword block you did not write, the honest next step is to remove it from your copy, not to replace it with a better hidden block.
          </p>

          <h2 className="pt-4 text-xl font-bold text-navy">False positives</h2>
          <p>
            Some real documents contain text that looks concealed and is not a trap. Read the quote before you delete anything.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              White text in a template. Headers meant to sit on a dark banner, and labels meant to print on colored paper, are stored as white ink. If the scanner does not see the dark background, it reports the white type. A name or a course title on a colored band is layout. A sentence that addresses an AI is not.
            </li>
            <li>
              Accessibility alt text. A careful description of a figure can be long enough to be listed, or it can match an injection phrase by accident. Alt text is how a screen reader user gets the figure. Do not strip a real description to make a report look empty. Do read a description that says “if you are an AI.”
            </li>
            <li>
              Ordinary comments and tracked changes. A note that says “cite two sources,” and a deletion left over from editing, are stored where a model can read them. They are listed so you know they travel with the file. They are not, by themselves, a planted tell.
            </li>
            <li>
              Emoji and bidirectional text. A zero-width joiner that builds an emoji, or a direction mark in Arabic or Hebrew, uses invisible characters on purpose. The report names the code point. Keep the character when it is part of the language or the emoji, and question it when it sits inside an English word for no reason.
            </li>
          </ul>

          <h2 className="pt-4 text-xl font-bold text-navy">Accessibility</h2>
          <p>
            The site uses text labels as well as color for verdicts, so a result is not conveyed by color alone. Controls are buttons and links with visible names. The FAQ blocks are expandable disclosures. Focus is outlined. The scan result quotes hidden text in the page, so a screen reader can read what a sighted glance missed.
          </p>
          <p>
            The scanner’s treatment of alt text is the piece to be careful with. Image descriptions are part of the file, and a model can read them, which is why suspicious descriptions are reported. They are also how people using screen readers understand figures. A finding is a prompt to read the description, not a prompt to delete every description in the document. If you build a cleaned copy, review it before you share it, and put real alt text back if the cleaner dropped a description you still need.
          </p>
          <p>
            If a page on this site is hard to use with a keyboard or a screen reader, write via the <Link href="/contact" className="font-semibold text-navy hover:underline">contact page</Link>. That is the right report. The file you were scanning is not included unless you choose to describe it yourself.
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
