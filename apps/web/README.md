# Alex Godfrey web app

The site is an Astro 7 application deployed with the Vercel adapter. Its page
shells are prerendered; the Airthings cards are server islands, and newsletter
operations remain dynamic API routes.

## Requirements

- Node.js 22.12 or newer
- pnpm 10

Install from the repository root:

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local
```

Fill in the local environment values before starting the app.

## Development

```sh
# Foreground Turbo development workflow
pnpm dev

# Astro 7 managed background server
pnpm dev:web:background
pnpm dev:web:status
pnpm dev:web:logs
pnpm dev:web:stop

# Structured JSON logs for automation
pnpm dev:web:json
```

Astro's background server is the preferred non-interactive workflow. Set
`ASTRO_DEV_BACKGROUND=0` to disable background management in an environment
that needs the foreground process.

## Verification

```sh
pnpm --filter @alexgodfrey/web check
pnpm --filter @alexgodfrey/web test:security
pnpm --filter @alexgodfrey/web build
```

To validate the production CSP before switching it on:

```sh
ASTRO_CSP_MODE=enforce pnpm --filter @alexgodfrey/web build
```

Use the generated production artifact for CSP browser testing. Vite's development
style injection and Astro's development toolbar are not representative of the
hashed deployment output.

## Runtime architecture

- Static pages explicitly export `prerender = true`.
- Airthings readings render through `server:defer`; their responses use a
  120-second edge TTL plus 180 seconds of stale-while-revalidate.
- Astro's Vercel cache provider backs those route-cache directives. The provider
  is still experimental upstream, so cache headers and hit behavior should be
  checked after adapter upgrades.
- Newsletter APIs are dynamic and fail closed in production unless distributed
  database rate limiting and Cloudflare Turnstile are configured.
- The default CSP is report-only and is delivered by both Astro middleware and
  `vercel.json`. `ASTRO_CSP_MODE=enforce` enables Astro's hashed CSP for scripts
  and styles. Prism replaces Shiki's inline token styles, and full-page
  navigation replaces CSP-incompatible view transitions. ChatDB and Cloudflare
  Turnstile are the only external frame/script exceptions.
- Aspekta and Berkeley Mono are managed by Astro's Fonts API from
  `src/assets/fonts`.

See `.env.example` for every required production value and `UPGRADE_LOG.md` at
the repository root for the migration record.
