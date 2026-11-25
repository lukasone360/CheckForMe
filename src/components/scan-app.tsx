"use client";

import { useEffect, useId, useState } from "react";
import { getMode, type ScanModeId } from "@/lib/modes";
import { ModeSwitch } from "./mode-switch";
import { ResultsView } from "./results-view";
import { ScanningScreen } from "./scanning-screen";
import { useScanSession } from "./scan-session";
import { ShieldMark } from "./logo";

export function ScanApp({
  hero = false,
  showModes = false,
  mode: modeId = "homework",
}: {
  hero?: boolean;
  showModes?: boolean;
  mode?: ScanModeId;
}) {
  const mode = getMode(modeId);
  const inputId = useId();
  const pasteId = useId();
  const [dragOver, setDragOver] = useState(false);
  const session = useScanSession();
  const {
    scanning,
    startedAt,
    scanningName,
    error,
    result,
    paste,
    setPaste,
    copied,
    busy,
    sampleBusy,
    inputRef,
    generation,
    takeScroll,
    onFiles,
    loadSample,
    reset,
    copyClean,
    downloadClean,
    exportReport,
    scanPasted,
  } = session;

  useEffect(() => {
    if (!result || !takeScroll(generation)) return;
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result, generation, takeScroll]);

  const idleHero = hero && !result && !scanning;

  return (
    <div id="scan" className={idleHero ? "px-4 pb-6 pt-12 sm:pt-16" : showModes ? "px-4 pb-12 pt-8" : "px-4 pb-12"}>
      {idleHero ? (
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">{mode.headline}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {mode.helper[0]}
            <br />
            {mode.helper[1]}
          </p>
        </div>
      ) : null}

      {showModes ? <ModeSwitch current={mode.id} /> : null}

      {scanning ? <ScanningScreen fileName={scanningName} startedAt={startedAt} /> : null}

      {result && !scanning ? (
        <ResultsView
          key={mode.id}
          result={result}
          copied={copied}
          busy={busy}
          onCopy={() => void copyClean()}
          onDownload={() => void downloadClean()}
          onExport={() => exportReport(mode.verdicts[result.verdict], mode.categoryOrder)}
          onReset={reset}
          verdictLabels={mode.verdicts}
          categoryOrder={mode.categoryOrder}
          emphasisNote={mode.emphasisNote}
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

          <div className="mt-4">
            <button
              type="button"
              onClick={() => void loadSample()}
              disabled={sampleBusy}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm hover:bg-mist disabled:opacity-60"
            >
              {sampleBusy ? "Loading sample…" : "Try a sample trapped file"}
            </button>
            <p className="mt-2 text-center text-xs leading-relaxed text-muted">
              A built-in demo PDF with white text, tiny type, a prompt injection, and a zero-width character. It stays in this tab.
            </p>
          </div>

          <div className="mt-5">
            <label htmlFor={pasteId} className="text-sm font-semibold text-ink">
              {mode.pasteLabel}
            </label>
            <textarea
              id={pasteId}
              value={paste}
              onChange={(event) => setPaste(event.target.value)}
              rows={5}
              placeholder={mode.pastePlaceholder}
              className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm leading-relaxed text-ink shadow-sm placeholder:text-[#8b98a8]"
            />
            <button
              type="button"
              disabled={paste.trim().length === 0}
              onClick={() => void scanPasted()}
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
