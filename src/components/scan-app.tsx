"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buildCleanDownload, buildReportHtml } from "@/lib/clean-document";
import { remainingScanDelay } from "@/lib/scan-steps";
import { scanBytes, scanText } from "@/lib/scan";
import type { ScanResult } from "@/lib/types";
import { ResultsView } from "./results-view";
import { ScanningScreen } from "./scanning-screen";
import { ShieldMark } from "./logo";

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function saveFile(bytes: Uint8Array, fileName: string, mimeType: string) {
  const blob = new Blob([Uint8Array.from(bytes)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ScanApp({ hero = false }: { hero?: boolean }) {
  const inputId = useId();
  const pasteId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const runToken = useRef(0);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [scanningName, setScanningName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (result) document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function run(fileName: string, bytes: Uint8Array | null, task: () => Promise<ScanResult>) {
    const token = runToken.current + 1;
    runToken.current = token;
    setScanning(true);
    setStartedAt(performance.now());
    setScanningName(fileName);
    setError(null);
    setResult(null);
    setCopied(false);
    setSourceBytes(bytes);
    const started = performance.now();
    try {
      const next = await task();
      const wait = remainingScanDelay(performance.now() - started);
      if (wait > 0) await sleep(wait);
      if (runToken.current !== token) return;
      setResult(next);
    } catch (caught) {
      if (runToken.current !== token) return;
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Something went wrong while scanning.");
    } finally {
      if (runToken.current === token) setScanning(false);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void file.arrayBuffer().then((buffer) => {
      const bytes = new Uint8Array(buffer);
      void run(file.name || "assignment", bytes, () => scanBytes(bytes, file.name || "assignment"));
    });
  }

  function reset() {
    runToken.current += 1;
    setResult(null);
    setError(null);
    setPaste("");
    setCopied(false);
    setScanning(false);
    setSourceBytes(null);
    if (inputRef.current) inputRef.current.value = "";
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  async function downloadClean() {
    if (!result) return;
    setBusy(true);
    setError(null);
    try {
      const file = await buildCleanDownload(result, sourceBytes);
      saveFile(file.bytes, file.fileName, file.mimeType);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not build the cleaned file.");
    } finally {
      setBusy(false);
    }
  }

  function exportReport() {
    if (!result) return;
    const html = buildReportHtml(result);
    const base = result.fileName.replace(/\.[^.]+$/, "") || "assignment";
    saveFile(new TextEncoder().encode(html), `${base}.report.html`, "text/html;charset=utf-8");
  }

  return (
    <div id="scan" className={hero && !result && !scanning ? "px-4 pb-6 pt-12 sm:pt-16" : "px-4 pb-12"}>
      {hero && !result && !scanning ? (
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

      {scanning ? <ScanningScreen fileName={scanningName} startedAt={startedAt} /> : null}

      {result && !scanning ? (
        <ResultsView
          result={result}
          copied={copied}
          busy={busy}
          onCopy={() => void copyClean()}
          onDownload={() => void downloadClean()}
          onExport={exportReport}
          onReset={reset}
        />
      ) : null}

      {!result && !scanning ? (
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
            <p className="mt-4 text-xl font-extrabold text-ink">Drag your file here</p>
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
              disabled={paste.trim().length === 0}
              onClick={() => void run("Pasted text", null, () => scanText(paste, "Pasted text"))}
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
      ) : null}

      {error && (result || scanning) ? (
        <p role="alert" className="mx-auto mt-4 max-w-3xl rounded-xl border border-[#f3c2cb] bg-[#fff5f6] px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {hero && !result && !scanning ? <FeatureCards /> : null}
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
