import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { adsenseClient } from "@/lib/ads";
import { site } from "@/lib/site";
import "./globals.css";

const adsAccount = adsenseClient();

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-family",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s · CheckForMe",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
  ...(adsAccount ? { other: { "google-adsense-account": adsAccount } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ads = adsenseClient();
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans antialiased`}>
        {children}
        {ads ? (
          <Script
            id="adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <Analytics />
      </body>
    </html>
  );
}
