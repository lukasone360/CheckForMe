"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { scanFile, scanText } from "@/lib/scan";
import type { Finding, ScanResult, Severity } from "@/lib/types";
import { ShieldMark } from "./logo";

const severityStyles: Record<Severity, string> = {
  high: "bg-[#fde8ec] text-danger",
  medium: "bg-[#fff4d6] text-warn",
  low: "bg-mist text-[#3e4e63]",
};

const verdictStyles = {
  clean: {
    wrap: "border-[#b7ebc9] bg-[#f3fbf6]",
    title: "text-green-dark",
  },
  suspicious: {
    wrap: "border-[#f3dd9a] bg-[#fff9eb]",
    title: "text-warn",
  },
  traps_found: {
    wrap: "border-[#f3c2cb] bg-[#fff5f6]",
    title: "text-danger",
  },
} as const;

export function ScanApp({ hero = false }: { hero?: boolean }) {
  const inputId = useId();
  const pasteId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function run(task: () => Promise<ScanResult>) {
    setScanning(true);
    setError(null);
    setCopied(false);
    try {
      setResult(await task());
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Something went wrong while scanning.");
    } finally {
      setScanning(false);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void run(() => scanFile(file));
  }

  function reset() {
    setResult(null);
    setError(null);
    setPaste("");
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyClean() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.cleanText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div id="scan" className={hero ? "px-4 pb-6 pt-12 sm:pt-16" : "px-4 py-10"}>
      {hero && !result ? (
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
            Check your assignment for hidden AI traps
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            White text, tiny fonts, prompt injections — found in seconds.
            <br />
            Files never leave your device.
          </p>
        </div>
      ) : null}

      {result ? (
        <Results
          result={result}
          copied={copied}
          onCopy={copyClean}
          onReset={reset}
          resultsRef={resultsRef}
        />
      ) : (
        <div className="mx-auto mt-8 w-full max-w-xl">
          <label
            htmlFor={inputId}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              onFiles(event.dataTransfer.files);
            }}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
              dragOver ? "border-green bg-[#f3fbf6]" : "border-[#c5d0de] bg-[#f7f9fc]"
            }`}
          >
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              onChange={(event) => onFiles(event.target.files)}
            />
            <ShieldMark className="mx-auto h-14 w-14" />
            <p className="mt-4 text-xl font-extrabold text-ink">
              {scanning ? "Scanning in your browser…" : "Drag your file here"}
            </p>
            <p className="mt-1 text-sm text-muted">or click to browse.</p>
            <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted">
              <span className="h-px flex-1 bg-[#d5deea]" />
              or
              <span className="h-px flex-1 bg-[#d5deea]" />
            </div>
            <p className="text-sm text-muted">Supports PDF, DOCX, and pasted text</p>
          </label>

          <div className="mt-5">
            <label htmlFor={pasteId} className="text-sm font-semibold text-ink">
              Or paste assignment text
            </label>
            <textarea
              id={pasteId}
              value={paste}
              onChange={(event) => setPaste(event.target.value)}
              rows={5}
              placeholder="Paste a question, or the paragraph that looks a little too clean."
              className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm leading-relaxed text-ink shadow-sm placeholder:text-[#8b98a8]"
            />
            <button
              type="button"
              disabled={scanning || paste.trim().length === 0}
              onClick={() => void run(() => scanText(paste, "Pasted text"))}
              className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Scan pasted text
            </button>
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-xl border border-[#f3c2cb] bg-[#fff5f6] px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      )}

      {hero && !result ? <FeatureCards /> : null}
    </div>
  );
}

function FeatureCards() {
  const cards = [
    {
      title: "Private by design",
      body: "Scans run in your browser. Nothing is uploaded or stored.",
      icon: <LockIcon />,
    },
    {
      title: "AI trap detection",
      body: "Finds hidden prompts, invisible text, and sneaky injections.",
      icon: <CheckIcon />,
    },
    {
      title: "Fast & lightweight",
      body: "Deep scan in seconds. No sign-up. No account required.",
      icon: <BoltIcon />,
    },
  ];
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="rounded-2xl border border-line bg-[#f7f9fc] px-5 py-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f8ee] text-green-dark">
            {card.icon}
          </div>
          <h2 className="font-bold text-ink">{card.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{card.body}</p>
        </article>
      ))}
    </div>
  );
}

function Results({
  result,
  copied,
  onCopy,
  onReset,
  resultsRef,
}: {
  result: ScanResult;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
  resultsRef: RefObject<HTMLDivElement | null>;
}) {
  const style = verdictStyles[result.verdict];
  const counts = {
    high: result.findings.filter((finding) => finding.severity === "high").length,
    medium: result.findings.filter((finding) => finding.severity === "medium").length,
    low: result.findings.filter((finding) => finding.severity === "low").length,
  };
  return (
    <div ref={resultsRef} className="mx-auto max-w-3xl scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{result.fileName}</span>
          {" · "}
          {result.fileType.toUpperCase()}
          {result.pageCount ? ` · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}` : ""}
          {" · scanned in your browser"}
        </p>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-navy hover:underline">
          Scan another file
        </button>
      </div>

      <div className={`mt-4 rounded-2xl border px-5 py-5 ${style.wrap}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Verdict</p>
        <h2 className={`mt-1 text-3xl font-extrabold tracking-tight ${style.title}`}>{result.verdictTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">{result.verdictDetail}</p>
        {result.findings.length > 0 ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {counts.high} high · {counts.medium} medium · {counts.low} low
          </p>
        ) : null}
      </div>

      {result.findings.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {result.findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </ul>
      ) : null}

      {result.segments.length > 0 ? (
        <section className="mt-8">
          <h3 className="text-lg font-bold text-navy">Text with traps highlighted</h3>
          <p className="mt-1 text-sm text-muted">
            <span className="mr-3 inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#ffe08a]" /> Concealed text
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#ffd0d6]" /> Prompt injection
            </span>
          </p>
          <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-line bg-white px-4 py-4 text-sm leading-relaxed text-ink">
            {result.segments.map((segment, index) => {
              if (segment.kind === "plain") return <span key={index}>{segment.text}</span>;
              const className =
                segment.kind === "hidden"
                  ? "rounded bg-[#ffe08a] px-0.5"
                  : "rounded bg-[#ffd0d6] px-0.5";
              return (
                <mark key={index} className={className}>
                  {segment.text}
                </mark>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-line bg-mist px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-navy">Cleaned copy</h3>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white"
          >
            {copied ? "Copied" : "Copy clean text"}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Concealed text, invisible characters, and high-confidence trap sentences are removed. Visible writing stays.
        </p>
        <textarea
          readOnly
          value={result.cleanText || "No visible assignment text remained after removing hidden traps."}
          rows={8}
          className="mt-3 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm leading-relaxed text-ink"
          aria-label="Cleaned assignment text"
        />
      </section>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <li className="rounded-2xl border border-line bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${severityStyles[finding.severity]}`}>
          {finding.severity}
        </span>
        <h3 className="font-bold text-ink">{finding.title}</h3>
      </div>
      <p className="mt-1 text-sm text-muted">{finding.location}</p>
      <blockquote className="mt-3 rounded-xl bg-[#fff6d8] px-3 py-2 text-sm leading-relaxed text-ink">
        {finding.text}
      </blockquote>
      <p className="mt-2 text-sm leading-relaxed text-muted">{finding.description}</p>
    </li>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12.2 11 14.6 15.7 9.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M13 3 6 13h5l-1 8 8-12h-5l0-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
