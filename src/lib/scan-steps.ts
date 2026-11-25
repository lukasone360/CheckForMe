/** Shown while a scan runs. The UI holds at least this long so the steps can be read. */
export const MIN_SCAN_MS = 10_000;

export const SCAN_STEPS = [
  "Reading your document…",
  "Looking for white text…",
  "Checking for tiny fonts…",
  "Looking for prompt injections…",
  "Scanning invisible characters…",
  "Inspecting comments and metadata…",
  "Double-checking results…",
] as const;

export function remainingScanDelay(elapsedMs: number, minMs = MIN_SCAN_MS): number {
  return Math.max(0, minMs - elapsedMs);
}
