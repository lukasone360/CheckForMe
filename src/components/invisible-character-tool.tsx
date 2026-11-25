"use client";

import { useId, useState } from "react";
import { findHomoglyphs, findInvisible, stripInvisible, visualizeInvisible } from "@/lib/unicode";
import type { HomoglyphHit, InvisibleHit } from "@/lib/unicode";

const samples = [
  {
    label: "Zero-width space",
    text: "The mito\u200Bchondria is the powerhouse of the cell.",
  },
  {
    label: "Bidi override",
    text: "The formula reads \u202Esecret\u202C on the board.",
  },
  {
    label: "Homoglyph",
    text: "The capital of France is P\u0430ris today.",
  },
] as const;

export function InvisibleCharacterTool() {
  const fieldId = useId();
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<string | null>(null);

  const invisible = checked == null ? [] : findInvisible(checked);
  const homoglyphs = checked == null ? [] : findHomoglyphs(checked);
  const zeroWidth = invisible.filter((hit) => hit.kind === "zero-width");
  const bidi = invisible.filter((hit) => hit.kind === "bidi");

  return (
    <section aria-label="Invisible character check" className="mt-8 rounded-2xl border border-line bg-[#f7f9fc] p-5">
      <h2 className="text-xl font-extrabold tracking-tight text-navy">Check pasted text</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Uses the same zero-width, bidi, and homoglyph checks as a file scan. The paste stays in this tab.
      </p>
      <label htmlFor={fieldId} className="mt-4 block text-sm font-semibold text-ink">
        Text to check
      </label>
      <textarea
        id={fieldId}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        placeholder="Paste a paragraph that looks a little too clean."
        className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm leading-relaxed text-ink shadow-sm placeholder:text-[#8b98a8]"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={text.trim().length === 0}
          onClick={() => setChecked(text)}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check characters
        </button>
        {samples.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => {
              setText(sample.text);
              setChecked(sample.text);
            }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-mist"
          >
            Try {sample.label.toLowerCase()}
          </button>
        ))}
      </div>

      {checked != null ? (
        <div aria-live="polite" className="mt-5">
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Count label="Zero-width" value={zeroWidth.length} />
            <Count label="Bidi controls" value={bidi.length} />
            <Count label="Homoglyphs" value={homoglyphs.length} />
          </dl>
          {invisible.length === 0 && homoglyphs.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-ink">
              No zero-width characters, bidi overrides, or homoglyphs found in this paste.
            </p>
          ) : (
            <CharacterTable invisible={invisible} homoglyphs={homoglyphs} source={checked} />
          )}
          <h3 className="mt-5 text-sm font-bold text-navy">With invisible characters marked</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-xl border border-line bg-white px-3 py-3 text-sm leading-relaxed text-ink">
            {visualizeInvisible(checked)}
          </p>
          <h3 className="mt-4 text-sm font-bold text-navy">Text with those characters removed</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-xl border border-line bg-white px-3 py-3 text-sm leading-relaxed text-ink">
            {stripInvisible(checked)}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white px-2 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-1 text-2xl font-extrabold ${value > 0 ? "text-danger" : "text-green-dark"}`}>{value}</dd>
    </div>
  );
}

function CharacterTable({
  invisible,
  homoglyphs,
  source,
}: {
  invisible: InvisibleHit[];
  homoglyphs: HomoglyphHit[];
  source: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Invisible characters and homoglyphs in the paste</caption>
        <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Kind</th>
            <th scope="col" className="px-3 py-2 font-semibold">Detail</th>
            <th scope="col" className="px-3 py-2 font-semibold">Context</th>
          </tr>
        </thead>
        <tbody>
          {invisible.map((hit, index) => (
            <tr key={`i-${hit.index}-${index}`} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-3 py-2 font-semibold text-ink">
                {hit.kind === "bidi" ? "Bidi" : "Zero-width"}
              </th>
              <td className="px-3 py-2 text-ink">
                {hit.label} · U+{hit.code.toString(16).toUpperCase().padStart(4, "0")}
                {hit.insideWord ? " · inside a word" : ""}
              </td>
              <td className="px-3 py-2 text-muted">{contextAround(source, hit.index)}</td>
            </tr>
          ))}
          {homoglyphs.map((hit, index) => (
            <tr key={`h-${hit.index}-${index}`} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-3 py-2 font-semibold text-ink">Homoglyph</th>
              <td className="px-3 py-2 text-ink">{hit.word}</td>
              <td className="px-3 py-2 text-muted">{contextAround(source, hit.index)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function contextAround(source: string, index: number): string {
  const start = Math.max(0, index - 18);
  const end = Math.min(source.length, index + 18);
  const snippet = visualizeInvisible(source.slice(start, end)).replace(/\s+/g, " ");
  return `${start > 0 ? "…" : ""}${snippet}${end < source.length ? "…" : ""}`;
}
