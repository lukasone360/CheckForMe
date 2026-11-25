# CheckForMe

CheckForMe is a single-purpose site that scans a homework file for hidden AI traps: white or low-contrast text, tiny fonts, invisible Unicode, text off the page or behind a shape, Word hidden formatting, and prompt-injection phrases. The verdict is clean, suspicious, or traps found.

Scanning runs entirely in the browser. Files are not uploaded.

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev` and `npm run build` copy the PDF.js worker, standard fonts, and cmaps into `public/pdfjs/` first. That folder is gitignored.

Optional environment variables live in `.env.example`. Copy it to `.env.local` if you want a real canonical URL, a contact email, or AdSense:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, and robots. Defaults to `https://checkforme.local`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the privacy policy, terms, and footer. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher id. When unset, every ad slot renders nothing and the AdSense script is not loaded. |

Set the AdSense id, then pass a slot id into `<AdSlot slot="..." />`. The component labels the unit as an advertisement only after the client id exists.

## Tests and sample files

Sample traps live in `samples/`. Regenerate them with:

```bash
npm run generate-samples
npm test
```

The suite checks that each detector fires on a planted file and that clean PDF, DOCX, and text files come back with no findings. Detectors covered:

- white and low-contrast text
- tiny fonts
- transparent text and PDF invisible rendering
- off-page text and text covered by a shape
- Word vanish formatting
- zero-width characters, bidi overrides, and homoglyphs
- prompt-injection phrasing in the body, metadata, comments, alt text, form fields, annotations, and tracked changes

## Deploy on Vercel

The app is a standard Next.js App Router project. No extra build settings are required.

1. Push this repository to GitHub.
2. In Vercel, import the project. Framework preset: Next.js. Root directory: the repo root.
3. Add the environment variables from `.env.example` if you use them. Set `NEXT_PUBLIC_SITE_URL` to the public URL, including `https://`.
4. Deploy. Vercel runs `npm run build`, which copies the PDF.js assets before `next build`.

A later change to an environment variable needs a redeploy, because `NEXT_PUBLIC_*` values are inlined at build time.

## Point a Cloudflare domain at Vercel

Register or transfer the domain in Cloudflare, then:

1. In the Vercel project, open **Settings → Domains** and add the domain (`checkforme.com`) and, if you want it, `www`.
2. Vercel shows the DNS records it expects. For an apex domain, add an **A** record for `@` pointing at `76.76.21.21`. For `www`, add a **CNAME** pointing at `cname.vercel-dns.com`.
3. In the Cloudflare DNS editor, create those records. Set the proxy status to **DNS only** (grey cloud) for the Vercel records so Vercel can issue the certificate. An orange-cloud proxy in front of Vercel often breaks certificate issuance.
4. Wait until Vercel marks the domain as valid. HTTPS is issued by Vercel after DNS resolves.
5. Optional: in Cloudflare, redirect the apex to `www` or the reverse, matching the primary domain you chose in Vercel. Keep that redirect’s record proxied only if it is a Cloudflare redirect rule, not the Vercel A/CNAME itself.
6. Set `NEXT_PUBLIC_SITE_URL` to the final origin and redeploy so the sitemap and Open Graph URLs match.

Cloudflare’s nameservers stay in place. Only the A and CNAME records above need to target Vercel.

## Stack

Next.js (App Router), TypeScript, and Tailwind CSS. PDF text, color, size, opacity, rendering mode, and position come from PDF.js. DOCX is unzipped with JSZip and read as XML in the browser. There is no server route for uploads.
