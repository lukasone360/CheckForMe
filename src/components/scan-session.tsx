"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode, type RefObject } from "react";
import { buildCleanDownload, buildReportHtml } from "@/lib/clean-document";
import type { CategoryId } from "@/lib/categories";
import { remainingScanDelay } from "@/lib/scan-steps";
import { scanBytes, scanText } from "@/lib/scan";
import type { ScanResult } from "@/lib/types";

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

type ScanSessionValue = {
  scanning: boolean;
  startedAt: number;
  scanningName: string;
  error: string | null;
  result: ScanResult | null;
  sourceBytes: Uint8Array | null;
  paste: string;
  setPaste: (value: string) => void;
  copied: boolean;
  busy: boolean;
  sampleBusy: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Bumps when a scan finishes, so a remounted results view does not scroll again. */
  generation: number;
  takeScroll: (generation: number) => boolean;
  requestKeyboardFocus: () => void;
  consumeKeyboardFocus: () => boolean;
  run: (fileName: string, bytes: Uint8Array | null, task: () => Promise<ScanResult>) => Promise<void>;
  onFiles: (files: FileList | null) => void;
  loadSample: () => Promise<void>;
  reset: () => void;
  copyClean: () => Promise<void>;
  downloadClean: () => Promise<void>;
  exportReport: (verdictLabel: string, categoryOrder: readonly CategoryId[]) => void;
  scanPasted: () => Promise<void>;
};

const ScanSessionContext = createContext<ScanSessionValue | null>(null);

export function ScanProvider({ children }: { children: ReactNode }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const runToken = useRef(0);
  const focusOnMount = useRef(false);
  const scrolledGeneration = useRef(0);
  const [scanning, setScanning] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [scanningName, setScanningName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [generation, setGeneration] = useState(0);

  const requestKeyboardFocus = useCallback(() => {
    focusOnMount.current = true;
  }, []);

  const consumeKeyboardFocus = useCallback(() => {
    const pending = focusOnMount.current;
    focusOnMount.current = false;
    return pending;
  }, []);

  const takeScroll = useCallback((next: number) => {
    if (scrolledGeneration.current >= next) return false;
    scrolledGeneration.current = next;
    return true;
  }, []);

  const run = useCallback(async (fileName: string, bytes: Uint8Array | null, task: () => Promise<ScanResult>) => {
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
      setGeneration((current) => current + 1);
    } catch (caught) {
      if (runToken.current !== token) return;
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Something went wrong while scanning.");
    } finally {
      if (runToken.current === token) setScanning(false);
    }
  }, []);

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      void file.arrayBuffer().then((buffer) => {
        const bytes = new Uint8Array(buffer);
        const name = file.name || "assignment";
        void run(name, bytes, () => scanBytes(bytes, name));
      });
    },
    [run],
  );

  const loadSample = useCallback(async () => {
    setSampleBusy(true);
    setError(null);
    try {
      const response = await fetch("/demo/trapped-assignment.pdf");
      if (!response.ok) throw new Error("The sample file could not be loaded.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      await run("trapped-assignment.pdf", bytes, () => scanBytes(bytes, "trapped-assignment.pdf"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The sample file could not be loaded.");
    } finally {
      setSampleBusy(false);
    }
  }, [run]);

  const reset = useCallback(() => {
    runToken.current += 1;
    setResult(null);
    setError(null);
    setPaste("");
    setCopied(false);
    setScanning(false);
    setSourceBytes(null);
    if (inputRef.current) inputRef.current.value = "";
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const copyClean = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.cleanText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [result]);

  const downloadClean = useCallback(async () => {
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
  }, [result, sourceBytes]);

  const exportReport = useCallback(
    (verdictLabel: string, categoryOrder: readonly CategoryId[]) => {
      if (!result) return;
      const html = buildReportHtml(result, { verdictLabel, categoryOrder });
      const base = result.fileName.replace(/\.[^.]+$/, "") || "assignment";
      saveFile(new TextEncoder().encode(html), `${base}.report.html`, "text/html;charset=utf-8");
    },
    [result],
  );

  const scanPasted = useCallback(async () => {
    await run("Pasted text", null, () => scanText(paste, "Pasted text"));
  }, [paste, run]);

  const value: ScanSessionValue = {
    scanning,
    startedAt,
    scanningName,
    error,
    result,
    sourceBytes,
    paste,
    setPaste,
    copied,
    busy,
    sampleBusy,
    inputRef,
    generation,
    takeScroll,
    requestKeyboardFocus,
    consumeKeyboardFocus,
    run,
    onFiles,
    loadSample,
    reset,
    copyClean,
    downloadClean,
    exportReport,
    scanPasted,
  };

  return <ScanSessionContext.Provider value={value}>{children}</ScanSessionContext.Provider>;
}

export function useScanSession(): ScanSessionValue {
  const session = useContext(ScanSessionContext);
  if (!session) throw new Error("ScanProvider is missing");
  return session;
}
