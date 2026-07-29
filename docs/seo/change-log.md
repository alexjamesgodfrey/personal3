# SEO implementation change log

**Target branch:** `main`
**Date:** 2026-07-29

## Entity and visible content

- `apps/web/src/lib/site-content.ts`
  - Added an answer-first identity summary.
  - Named Cornell University in visible source content.
  - Added `givenName`, `familyName`, and `alumniOf` to the `Person` graph.
  - Connected the `WebSite` graph to the stable Person ID.
- `apps/web/src/pages/index.astro`
  - Rendered the identity summary before widgets.
  - Changed the decorative `Godfrey` heading to a non-heading element.
  - Added crawlable profile, writing, newsletter, and contact links.
  - Preserved the pre-existing collapsed-header padding change from `1rem` to `2rem`.

## Canonicalization and crawl control

- `apps/web/src/lib/site-content.ts` and `apps/web/src/layouts/BaseLayout.astro`
  - Added slashless canonical normalization.
- `apps/web/astro.config.mjs` and `apps/web/vercel.json`
  - Added slashless route policy.
  - Enabled static-header support.
- `apps/web/src/pages/sitemap.xml.ts`
  - Removed Markdown, LLM, and other duplicate URLs.
  - Retained only canonical HTML landing pages and published articles.
- `apps/web/src/lib/agent-http.ts`
  - Added `X-Robots-Tag: noindex, follow` to Markdown alternates.
- `apps/web/src/pages/llms.txt.ts`, `apps/web/src/pages/llms-full.txt.ts`, and `apps/web/vercel.json`
  - Added a defense-in-depth noindex policy for machine retrieval documents.
- `apps/web/src/pages/404.astro`
  - Added `noindex, follow`.

## Redirects and stale-result cleanup

- `apps/web/astro.config.mjs`
  - Replaced prerendered meta-refresh pages with HTTP redirect rules for `/old`, `/blog/ai`, and `/blog/ascorbic-acid-ph`.
- Removed the three obsolete redirect-only Astro page files.
- Added `apps/web/src/pages/resume90222.pdf.ts`
  - Returns HTTP 410 with `noindex, noarchive` for the obsolete résumé URL.

## Authorship and article presentation

- `apps/web/src/pages/blog/[slug].astro`
  - Added `By Alex Godfrey` linking to the canonical profile.
  - Added `| Alex Godfrey` to the document title.
  - Fixed long-title/control overlap.
  - Added explicit heading and source-link styles.
- `apps/web/src/content/notes/red-bull/index.mdx`
  - Preserved the author's original prose, title, description, dates, and image alternative text verbatim.
  - A broader draft rewrite was fully reverted before this work was committed.
- `apps/web/src/lib/agent-documents.ts`
  - Instructs retrieval agents to cite canonical HTML URLs.
  - Labels Markdown URLs as alternates.

## Performance and discovery

- `apps/web/src/pages/index.astro`
  - Replaced the ChatDB iframe with a lightweight outbound card, avoiding third-party requests on page load.
- `apps/web/src/components/grid/cellpaint-video.astro`
  - Replaced the autoplay MP4 element with an optimized, lazy-loaded looping GIF.
  - The 480×270, 8 fps GIF preserves the 3.13-second loop at approximately 1.03 MiB.
- `apps/web/src/layouts/BaseLayout.astro`
  - Prefers the lightweight SVG favicon.

## Verification

- `pnpm --filter @alexgodfrey/web test:agent-documents`: passed, 6/6.
- `pnpm --filter @alexgodfrey/web check`: passed with 0 errors, 0 warnings, and 0 hints.
- `pnpm --filter @alexgodfrey/web build`: passed.
- Final mobile Lighthouse candidate with the looping GIF: 920/1000 performance, 1000/1000 SEO, 3.23-second LCP, 1.68 MB transferred, and 32 requests.
- Built JSON-LD parses as a `WebSite` + `ProfilePage` + `Person` graph and a `BlogPosting`.
- Browser QA passed for the homepage identity block, lightweight ChatDB card, footer navigation, article byline, and article title layout.
- The generated GIF was visually inspected, its infinite-loop metadata was verified, and the built asset checksum matches the source asset.
- Development-route probes confirmed canonical HTML responses, noindex machine alternates, legacy redirects, a 410 obsolete résumé, and real 404 handling.

## Production dependency

Turnstile was already part of the newsletter's layered anti-spam system, alongside a honeypot and database-backed rate limits. Cloudflare's Managed widget remains the recommended production configuration. Its paired Vercel variables are:

- `PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY`
- `NEWSLETTER_TURNSTILE_SECRET_KEY`

The site key is public and used at build/client time. The secret stays server-only and is required for runtime Siteverify validation. Confirm the existing `NEWSLETTER_RATE_LIMIT_SECRET` remains configured, then deploy and repeat the production smoke test before submitting the sitemap.

## Cross-site discovery

- `apps/web/src/lib/site-content.ts`
  - Added the canonical wedding-gallery URL to the shared resource inventory.
- `apps/web/src/pages/index.astro`
  - Added one crawlable, descriptive footer link to the public wedding-gallery
    entrance.
- The gallery links back with a visible creator credit and matching `WebSite`
  creator metadata. The exchange is limited to one contextual link per public
  homepage; private gallery routes remain excluded from indexing.
