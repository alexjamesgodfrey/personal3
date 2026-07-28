# Dependency Upgrade Log

**Date:** 2026-07-24
**Project:** alexgodfrey
**Language:** TypeScript/JavaScript
**Manifest:** `package.json`

## Summary

| Metric             | Count |
| ------------------ | ----: |
| Updated            |     1 |
| Skipped            |     0 |
| Failed             |     0 |
| Requires attention |     0 |

## Successfully Updated

### turbo: 2.6.0 → 2.10.6

- Latest stable version verified against the npm registry.
- The manifest range moved from `^2.0.5` to `^2.10.6`; the previous lockfile resolved 2.6.0.
- The repository-local dependency and pnpm lockfile were updated.
- No application migration was required.
- Validation: `bun run turbo --version`, dry-run planning, production build, and a live development-server restart passed.

## Runtime Tooling

### Bun: 1.3.13 → 1.3.14

- Updated with Bun's built-in self-updater.
- Validation: `bun --version` reports 1.3.14.

## Validation Notes

- `bun run build`: passed.
- `bun run typecheck`: passed with no configured tasks.
- `bun run test`: passed with no configured tasks.
- `bun run lint`: existing failure in `packages/python` because its JS/TS glob matches no lintable files.
- `pnpm audit --audit-level high`: reports 77 existing advisories (9 low, 30 moderate, 37 high, and 1 critical) in dependencies outside this Turbo-only upgrade.
- Live server: running in tmux session `personal` on `http://localhost:4321/` with Turbo 2.10.6 and no global-version warning.

---

## Astro 7 modernization

**Date:** 2026-07-28

### Framework and integrations

- Astro was pinned to `7.1.3`.
- `@astrojs/mdx`, `@astrojs/react`, and `@astrojs/vercel` were upgraded to their
  Astro 7-compatible major versions.
- Vite moved to 8.x and Tailwind's Vite plugin/CSS package moved to 4.3.x.
- `sharp` is now a direct application dependency for deterministic social-image
  rendering.
- Content schemas now import `z` from `astro/zod`.

Astro 7's Rust compiler, Sätteri-powered MDX path, queued rendering, and the Vite
8/Rolldown toolchain are used as framework defaults; no legacy opt-in flags
remain.

### Application migrations

- Large homepage/work images are imported through Astro assets and rendered with
  responsive `Image`/`Picture` output.
- Airthings values are server islands with bounded route caching and Vercel's
  cache provider.
- Aspekta and Berkeley Mono moved from manual `@font-face` declarations to
  Astro's local Fonts API.
- CSP is staged in report-only mode with an environment-controlled,
  Astro-hashed enforcement build.
- Static routes explicitly prerender; only sensor/newsletter operations execute
  on demand.
- React hydration directives were deferred or removed, and the homepage popups
  now share the homepage's only React island. The Human/Machine control is
  static navigation.
- Every note emits a deterministic, content-versioned 1200×630 social image.
- Newsletter endpoints gained strict parsing, size/origin limits, distributed
  rate limiting, honeypots, Turnstile, opaque responses, and sanitized logs.
- Astro 7 background-dev and JSON-log commands are exposed through package
  scripts.

### Upgrade sequence

The migration was validated incrementally. Astro alone exposed the expected MDX
major mismatch; upgrading MDX then exposed the old Vercel adapter's removed
polyfill hook. Upgrading the React and Vercel integrations resolved those
compatibility boundaries before Vite/Tailwind and application migrations were
applied.

The final lockfile can emit an upstream optional WASM peer warning below
Vite/Rolldown (`@emnapi/*` alpha peer ranges). The native Rolldown path and
production build do not depend on that optional WASM fallback.

### Final verification

- `astro check`: 73 files, 0 errors, 0 warnings, 0 hints.
- Newsletter security suite: 24/24 tests passed.
- Default and enforced production builds completed without compiler warnings.
- The build emitted 44 responsive AVIF/WebP variants and four distinct
  1200×630 article social images.
- All 10 prerendered routes have enforced-CSP adapter headers; every one of the
  40 executable inline script/style blocks matches a generated SHA-256 hash.
- Browser QA passed at 1280px and 390px with no horizontal overflow. Homepage
  popups, server-island replacement, newsletter native validation, article
  metadata/images, typing, Three.js canvas, and static legacy routes all passed
  with a clean console.
- The production CSP artifact was served with its generated headers and passed
  homepage popup hydration, newsletter hydration, and article-script checks
  without CSP or console errors.
- Astro's background server start/status/log/stop lifecycle and JSON log output
  were exercised successfully.
- The deployed web-app dependency graph has no known audit advisories. The
  remaining monorepo audit findings are confined to legacy ESLint development
  tooling and are not part of the Vercel function graph.
- The compiled Vercel cache provider emits a 120-second CDN TTL,
  180-second stale-while-revalidate window, and Airthings cache tags. A deployed
  preview should still be checked for the platform-level `MISS` → `HIT`
  transition after release.
- A Vercel production build was also exercised with a local verification key.
  The actual production environment does not currently define
  `PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY`; production builds intentionally fail
  closed until a real Cloudflare Turnstile site key is configured.
