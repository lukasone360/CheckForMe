import Link from "next/link";
import { Logo, ShieldMark } from "./logo";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#security", label: "Security" },
  { href: "/#features", label: "Features" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <Link href="/" className="justify-self-start rounded-md" aria-label="CheckForMe home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#3e4e63] md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-navy">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3 md:gap-5">
          <span className="hidden items-center gap-1.5 text-sm font-medium text-[#3e4e63] lg:inline-flex">
            <ShieldMark className="h-4 w-4" />
            All checks stay private
          </span>
          <Link
            href="#scan"
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-deep"
          >
            <UploadIcon />
            Upload file
          </Link>
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto px-4 pb-3 text-sm font-medium text-[#3e4e63] md:hidden" aria-label="Primary">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 hover:text-navy">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none">
      <path d="M10 13.5V4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 8 10 4.5 13.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15.5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
