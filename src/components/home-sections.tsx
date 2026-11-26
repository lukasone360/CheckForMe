import Link from "next/link";
import { scanTopics } from "@/content/scan-topics";

export function HomeSections() {
  return (
    <>
      <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Drop the file", "PDF, DOCX, or a pasted paragraph. The file stays in this tab."],
            ["2", "Scan locally", "The browser reads text, color, size, position, and the places Word hides writing."],
            ["3", "Read the verdict", "Each finding shows the hidden text, where it was, and how serious it looks. Copy a cleaned version if you want one."],
          ].map(([step, title, body]) => (
            <li key={step} className="rounded-2xl border border-line px-5 py-5">
              <span className="text-sm font-bold text-green-dark">Step {step}</span>
              <h3 className="mt-1 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="security" className="bg-mist">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Security</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <p>
              The scan runs in the page. The file is not uploaded, and CheckForMe does not keep a copy. Closing the tab drops the document from memory.
            </p>
            <p>
              The hosting provider can still see ordinary web traffic, such as the page you requested and your IP address. That log does not include the assignment, because the assignment is never part of a request.
            </p>
            <p>
              Page views are counted with Vercel Web Analytics, which does not use cookies and does not receive the file. Ads may be served by third parties, including Google, which can use cookies to show ads based on your visits to this site and others. Details and how to opt out are in the{" "}
              <Link href="/privacy" className="font-semibold text-navy hover:underline">privacy policy</Link>.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">What the scan looks for</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Each check links to a guide on how that kind of trap is built, how to look for it yourself, and where the scanner can be wrong.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {scanTopics.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="block h-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink hover:border-navy">
                {item.label}
                <span className="mt-1 block text-xs font-semibold text-green-dark">Read the guide</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="mx-auto max-w-3xl px-4 pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">About</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          CheckForMe is a single-purpose checker run by Pixie Ventures: one job, no account, and a clear answer. It reports what is inside a file so concealed instructions are visible before you paste the document into a chatbot. It does not write the assignment, and a clean verdict is not a guarantee that nothing was missed.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/about" className="font-semibold text-navy hover:underline">More about how the scan works</Link>
        </p>
      </section>
    </>
  );
}
