import type { ReactNode } from "react";
import { ScanProvider } from "@/components/scan-session";

/** One provider for the three tool routes so a client navigation keeps the file and the scan. */
export default function ScannerLayout({ children }: { children: ReactNode }) {
  return <ScanProvider>{children}</ScanProvider>;
}
