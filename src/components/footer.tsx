import Link from "next/link";
import { landingPages, site } from "@/lib/site";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo compact />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            A single-purpose check for hidden text and prompt traps in assignment files. Scans stay on your device.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-navy">Product</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/#how-it-works" className="hover:text-navy">How it works</Link></li>
            <li><Link href="/#security" className="hover:text-navy">Security</Link></li>
            <li><Link href="/#features" className="hover:text-navy">What we detect</Link></li>
            <li><Link href="/faq" className="hover:text-navy">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-navy">Guides</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {landingPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="hover:text-navy">{page.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-navy">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/privacy" className="hover:text-navy">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-navy">Terms of use</Link></li>
            {site.contactEmail ? (
              <li>
                <a href={`mailto:${site.contactEmail}`} className="hover:text-navy">{site.contactEmail}</a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} CheckForMe. Files are scanned locally and are not uploaded.
      </div>
    </footer>
  );
}
