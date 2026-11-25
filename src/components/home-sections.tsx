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
              Parsing happens in the page. There is no upload endpoint and no file database. Closing the tab drops the document from memory.
            </p>
            <p>
              The hosting provider can still see ordinary web traffic, such as the page you requested and your IP address. That log does not include the assignment, because the assignment is never part of a request.
            </p>
            <p>
              If ads are switched on later, the ad network can set cookies. Until then, CheckForMe does not load an ad script. Details are in the privacy policy.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">What the scan looks for</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "White, near-white, and low-contrast text",
            "Transparent text and PDF invisible rendering",
            "Tiny fonts, under about 2 pt",
            "Text placed off the page or covered by a shape",
            "Word vanish, web-hidden, and spec-vanish formatting",
            "Zero-width characters and bidi overrides",
            "Cyrillic or Greek letters swapped into Latin words",
            "Prompt-injection phrases, including in text you can see",
            "Comments, metadata, image alt text, and form fields",
            "Deleted text still stored in tracked changes",
          ].map((item) => (
            <li key={item} className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="mx-auto max-w-3xl px-4 pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">About</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          CheckForMe is a single-purpose checker in the spirit of a small utility site: one job, no account, and a clear answer. It reports what is inside a homework file so concealed instructions are visible before you paste the assignment into a chatbot. It does not write the assignment, and a clean verdict is not a guarantee that nothing was missed.
        </p>
      </section>
    </>
  );
}
