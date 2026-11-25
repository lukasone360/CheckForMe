"use client";

import { useEffect, useId, useRef, useState } from "react";
import { groupFindings, safetyScore, scoreTone, type CategoryGroup, type CategoryId } from "@/lib/categories";
import type { Finding, ScanResult, TranscriptSegment, Verdict } from "@/lib/types";
import { AdSlot } from "./ad-slot";

const verdictClass: Record<Verdict, string> = {
  clean: "border-[#b7ebc9] bg-[#eefbf3] text-green-dark",
  suspicious: "border-[#f3dd9a] bg-[#fff8eb] text-warn",
  traps_found: "border-[#f6c9d0] bg-[#fff1f2] text-danger",
};

const toneStroke = { good: "#1fbf5b", warn: "#e09a12", bad: "#ef4d3a" };

export function ResultsView({
  result,
  copied,
  busy,
  onCopy,
  onDownload,
  onExport,
  onReset,
  verdictLabels,
  categoryOrder,
  emphasisNote,
}: {
  result: ScanResult;
  copied: boolean;
  busy: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onExport: () => void;
  onReset: () => void;
  verdictLabels: Record<Verdict, string>;
  categoryOrder: readonly CategoryId[];
  emphasisNote: string | null;
}) {
  const groups = groupFindings(result.findings, categoryOrder);
  const score = safetyScore(result.findings);
  const tone = scoreTone(score);
  const verdictLabel = verdictLabels[result.verdict];
  const [openId, setOpenId] = useState<string | null>(groups.find((group) => group.findings.length > 0)?.id ?? null);
  const [preview, setPreview] = useState<Finding | null>(null);
  const trapCount = result.findings.length;
  const caption =
    result.verdict === "clean"
      ? "No traps found"
      : result.verdict === "suspicious"
        ? `${trapCount} signal${trapCount === 1 ? "" : "s"} to review`
        : `${trapCount} trap${trapCount === 1 ? "" : "s"} found`;

  return (
    <div id="results" className="mx-auto w-full max-w-3xl scroll-mt-24 px-1 py-6 sm:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-navy">Scan Results</h1>
          <p className="mt-2 text-base text-muted">
            {result.fileName}, scanned just now
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d5deea] bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm hover:bg-mist"
          >
            <UploadIcon />
            Export Report
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-deep"
          >
            <RefreshIcon />
            Scan Again
          </button>
        </div>
      </div>

      <div className={`mt-10 flex items-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold ${verdictClass[result.verdict]}`}>
        <VerdictIcon verdict={result.verdict} />
        <span>{verdictLabel}</span>
      </div>

      <div className="mt-14 flex justify-center">
        <ScoreGauge score={score} caption={caption} tone={tone} />
      </div>

      {emphasisNote ? <p className="mt-6 text-sm leading-relaxed text-muted">{emphasisNote}</p> : null}

      <ul className="mt-14 overflow-hidden rounded-2xl border border-line bg-white">
        {groups.map((group) => (
          <CategoryRow
            key={group.id}
            group={group}
            open={openId === group.id}
            onToggle={() => setOpenId((current) => (current === group.id ? null : group.id))}
            onShow={setPreview}
          />
        ))}
      </ul>

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1aa84d] px-5 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#148a40]"
        >
          <CopyIcon />
          {copied ? "Copied" : "Copy clean text"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy bg-white px-5 py-4 text-base font-semibold text-navy hover:bg-mist disabled:opacity-60"
        >
          <DownloadIcon />
          {busy ? "Preparing…" : "Download clean document"}
        </button>
      </div>

      {preview ? (
        <DocumentPreview result={result} finding={preview} onClose={() => setPreview(null)} />
      ) : null}

      <AdSlot placement="results" />
    </div>
  );
}

function CategoryRow({
  group,
  open,
  onToggle,
  onShow,
}: {
  group: CategoryGroup;
  open: boolean;
  onToggle: () => void;
  onShow: (finding: Finding) => void;
}) {
  const found = group.findings.length > 0;
  return (
    <li className="border-b border-line last:border-b-0">
      {found ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full items-center gap-4 px-5 py-5 text-left hover:bg-mist sm:px-6"
        >
          <AlertIcon />
          <span className="flex-1 text-base font-semibold text-ink">{group.label}</span>
          <span className="text-sm font-semibold text-danger">Found ({group.findings.length})</span>
          <Chevron open={open} />
        </button>
      ) : (
        <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
          <CheckBubble />
          <span className="flex-1 text-base font-semibold text-ink">{group.label}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-dark">
            Clean
            <CheckBubble small />
          </span>
        </div>
      )}
      {found && open ? (
        <div className="space-y-4 bg-[#f8fafc] px-5 py-5 sm:px-6">
          {group.findings.map((finding) => (
            <article key={finding.id} className="rounded-xl border border-line bg-white px-4 py-4">
              <blockquote className="text-base leading-relaxed text-ink">
                <span className="mr-1 font-serif text-xl text-danger" aria-hidden="true">“</span>
                {finding.text}
              </blockquote>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="inline-flex items-start gap-2 text-sm text-muted">
                  <PinIcon />
                  <span>{finding.location}</span>
                </p>
                <button
                  type="button"
                  onClick={() => onShow(finding)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#2457c5] hover:underline"
                >
                  Show in document
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function DocumentPreview({
  result,
  finding,
  onClose,
}: {
  result: ScanResult;
  finding: Finding;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("trap-highlight")?.scrollIntoView({ block: "center" });
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(frame);
    };
  }, [finding.id]);

  const inBody = result.segments.some((segment) => segment.text.includes(finding.text));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0c1c33]/40 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-extrabold tracking-tight text-navy">Document preview</h2>
            <p className="mt-1 text-sm text-muted">{finding.location}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-navy hover:bg-mist">
            Close
          </button>
        </div>
        <div className="mt-6 whitespace-pre-wrap rounded-xl border border-line bg-[#fbfcfe] px-4 py-4 text-sm leading-7 text-ink">
          {!inBody ? (
            <p className="mb-4">
              <mark id="trap-highlight" className="rounded bg-[#ffe08a] px-0.5">{finding.text}</mark>
            </p>
          ) : null}
          {result.segments.length > 0 ? (
            <PreviewBody segments={result.segments} quote={finding.text} marked={inBody} />
          ) : (
            <p className="text-muted">This trap is stored outside the page body, in {finding.location.toLowerCase()}.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewBody({
  segments,
  quote,
  marked,
}: {
  segments: TranscriptSegment[];
  quote: string;
  marked: boolean;
}) {
  let placed = !marked;
  return (
    <>
      {segments.map((segment, index) => {
        if (!placed && segment.text.includes(quote)) {
          placed = true;
          const at = segment.text.indexOf(quote);
          return (
            <span key={index}>
              {segment.text.slice(0, at)}
              <mark id="trap-highlight" className="rounded bg-[#ffe08a] px-0.5">
                {quote}
              </mark>
              {segment.text.slice(at + quote.length)}
            </span>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
}

function ScoreGauge({ score, caption, tone }: { score: number; caption: string; tone: "good" | "warn" | "bad" }) {
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const captionClass = tone === "good" ? "text-green-dark" : tone === "warn" ? "text-warn" : "text-danger";
  return (
    <div className="relative h-64 w-64 sm:h-72 sm:w-72">
      <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="110" cy="110" r={radius} fill="none" stroke="#eceff3" strokeWidth="16" />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={toneStroke[tone]}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-6xl font-extrabold tracking-tight text-navy">
          {score}
          <span className="text-3xl font-bold text-[#9aa6b4]">/100</span>
        </p>
        <p className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold ${captionClass}`}>
          <MiniShield />
          {caption}
        </p>
      </div>
    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: ScanResult["verdict"] }) {
  const color = verdict === "clean" ? "#127a3a" : verdict === "suspicious" ? "#9a6700" : "#c4324a";
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path d="M12 3 5 6v6.2c0 4.2 2.8 7.6 7 8.8 4.2-1.2 7-4.6 7-8.8V6l-7-3z" fill={color} />
      {verdict === "clean" ? (
        <path d="M8.2 12.2 10.8 14.8 15.8 9.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M12 8v5M12 16.2v.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

function CheckBubble({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-[#e7f8ee] text-green-dark ${small ? "h-5 w-5" : "h-7 w-7"}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" className={small ? "h-3 w-3" : "h-4 w-4"} fill="none">
        <path d="M3.5 8.2 6.4 11 12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function AlertIcon() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fde8ec] text-danger" aria-hidden="true">
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
        <path d="M8 4.2v4.4M8 11.2v.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-5 w-5 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden="true" fill="none">
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" fill="none">
      <path d="M8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 14s4.5-3.4 4.5-7A4.5 4.5 0 0 0 3.5 7C3.5 10.6 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function MiniShield() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path d="M8 1.8 3.2 3.6v4.1c0 2.6 1.8 4.8 4.8 5.6 3-0.8 4.8-3 4.8-5.6V3.6L8 1.8z" fill="currentColor" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none">
      <path d="M10 13V5M6.5 8.2 10 4.8l3.5 3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none">
      <path d="M16 10a6 6 0 1 1-1.6-4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 4.5V8h-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="none">
      <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 13H4.5A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5V5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="none">
      <path d="M10 4v8M6.5 9.2 10 12.6l3.5-3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
