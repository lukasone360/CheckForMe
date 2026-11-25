"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { SCAN_MODES, type ScanModeId } from "@/lib/modes";
import { useScanSession } from "./scan-session";

export function ModeSwitch({ current }: { current: ScanModeId }) {
  const router = useRouter();
  const groupRef = useRef<HTMLDivElement>(null);
  const { requestKeyboardFocus, consumeKeyboardFocus } = useScanSession();

  useEffect(() => {
    if (!consumeKeyboardFocus()) return;
    groupRef.current?.querySelector<HTMLElement>("[aria-checked='true']")?.focus();
  }, [current, consumeKeyboardFocus]);

  function move(index: number) {
    const next = SCAN_MODES[index];
    if (!next || next.id === current) return;
    requestKeyboardFocus();
    router.push(next.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = SCAN_MODES.findIndex((mode) => mode.id === current);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move((index + 1) % SCAN_MODES.length);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move((index - 1 + SCAN_MODES.length) % SCAN_MODES.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(0);
    } else if (event.key === "End") {
      event.preventDefault();
      move(SCAN_MODES.length - 1);
    }
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-xl">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label="What are you checking?"
        onKeyDown={onKeyDown}
        className="flex w-full rounded-full border border-line bg-mist p-1"
      >
        {SCAN_MODES.map((mode) => {
          const selected = mode.id === current;
          return (
            <Link
              key={mode.id}
              href={mode.href}
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-2 text-center text-[11px] font-semibold leading-none focus-visible:z-10 sm:px-3 sm:text-sm ${
                selected ? "bg-white text-navy shadow-sm" : "text-[#3e4e63] hover:text-navy"
              }`}
            >
              {mode.switchLabel}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
