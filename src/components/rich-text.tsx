import Link from "next/link";
import type { ReactNode } from "react";

const LINK = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;

/** Renders internal markdown links. Other text is left as written. */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(LINK.source, "g");
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const label = match[1] ?? "";
    const href = match[2] ?? "";
    if (href.startsWith("/") && !href.startsWith("//")) {
      nodes.push(
        <Link
          key={`${match.index}-${href}`}
          href={href}
          className="font-semibold text-navy underline decoration-[#c5d0de] underline-offset-2 hover:decoration-navy"
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(match[0]);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
