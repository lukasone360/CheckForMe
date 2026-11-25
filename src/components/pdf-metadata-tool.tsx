"use client";

import { useId, useState } from "react";
import { readPdfMetadata } from "@/lib/extract/pdf";
import { missingStandardInfo, type MetadataField } from "@/lib/metadata-fields";
import { MAX_FILE_BYTES } from "@/lib/scan";
import { ScanError } from "@/lib/types";
import { ShieldMark } from "./logo";

type Report = {
  fileName: string;
  pageCount: number;
  fields: MetadataField[];
};

function isPdf(name: string, bytes: Uint8Array): boolean {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return true;
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

export function PdfMetadataTool() {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  async function read(name: string, bytes: Uint8Array) {
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      if (bytes.byteLength === 0) throw new ScanError("That file is empty.");
      if (bytes.byteLength > MAX_FILE_BYTES) throw new ScanError("Files need to be 20 MB or smaller.");
      if (!isPdf(name, bytes)) {
        throw new ScanError("This page reads PDF metadata only. Save the file as PDF, or use the document checker for DOCX.");
      }
      const next = await readPdfMetadata(bytes, name || "document.pdf");
      setReport(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "This PDF could not be read.");
    } finally {
      setBusy(false);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void file.arrayBuffer().then((buffer) => {
      void read(file.name || "document.pdf", new Uint8Array(buffer));
    });
  }

  async function loadSample() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/demo/trapped-assignment.pdf");
      if (!response.ok) throw new Error("The sample file could not be loaded.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      await read("trapped-assignment.pdf", bytes);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The sample file could not be loaded.");
      setBusy(false);
    }
  }

  const missing = report ? missingStandardInfo(report.fields) : [];
  const flagged = report?.fields.filter((field) => field.suspicious).length ?? 0;

  return (
    <div id="scan" className="mx-auto mt-8 w-full max-w-3xl">
      {!report ? (
        <>
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
              id={inputId}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={(event) => onFiles(event.target.files)}
            />
            <ShieldMark className="mx-auto h-14 w-14" />
            <p className="mt-4 text-xl font-extrabold text-ink">{busy ? "Reading metadata…" : "Drop a PDF here"}</p>
            <p className="mt-1 text-sm text-muted">or click to browse. PDF only. The file stays in this tab.</p>
          </label>
          <button
            type="button"
            onClick={() => void loadSample()}
            disabled={busy}
            className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm hover:bg-mist disabled:opacity-60"
          >
            {busy ? "Reading metadata…" : "Try the sample PDF"}
          </button>
        </>
      ) : (
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-navy">Metadata</h2>
              <p className="mt-1 text-sm text-muted">
                {report.fileName}
                {report.pageCount ? ` · ${report.pageCount} page${report.pageCount === 1 ? "" : "s"}` : ""}
                {flagged > 0 ? ` · ${flagged} flagged` : " · no instruction-like values"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReport(null);
                setError(null);
              }}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
            >
              Check another PDF
            </button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">PDF Info dictionary and XMP fields</caption>
              <thead className="bg-mist text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Field</th>
                  <th scope="col" className="px-4 py-3">Source</th>
                  <th scope="col" className="px-4 py-3">Value</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.fields.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-muted">
                      This PDF has no Info dictionary values and no XMP packet.
                    </td>
                  </tr>
                ) : (
                  report.fields.map((field) => (
                    <tr key={field.id} className={field.suspicious ? "bg-[#fff8eb]" : "bg-white"}>
                      <th scope="row" className="border-t border-line px-4 py-3 align-top font-semibold text-ink">
                        {field.name}
                      </th>
                      <td className="border-t border-line px-4 py-3 align-top text-muted">{field.source}</td>
                      <td className="border-t border-line px-4 py-3 align-top text-ink">
                        <span className="whitespace-pre-wrap break-words">{field.value}</span>
                        {field.reason ? <span className="mt-1 block text-xs font-medium text-warn">{field.reason}</span> : null}
                      </td>
                      <td className="border-t border-line px-4 py-3 align-top">
                        {field.suspicious ? (
                          <span className="inline-flex rounded-full bg-[#fff1f2] px-2 py-0.5 text-xs font-semibold text-danger">Flagged</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#eefbf3] px-2 py-0.5 text-xs font-semibold text-green-dark">Clear</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {missing.length > 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">Not set in this file: {missing.join(", ")}.</p>
          ) : null}
        </div>
      )}
      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-[#f3c2cb] bg-[#fff5f6] px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
