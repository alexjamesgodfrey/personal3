import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { cacheVercel } from '@astrojs/vercel/cache';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField, fontProviders, logHandlers } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const configEnvironment = loadEnv(
  process.env.NODE_ENV ?? 'development',
  fileURLToPath(new URL('.', import.meta.url)),
  '',
);
const cspMode = configEnvironment.ASTRO_CSP_MODE ?? 'report-only';

if (!['report-only', 'enforce'].includes(cspMode)) {
  throw new Error('ASTRO_CSP_MODE must be either "report-only" or "enforce".');
}

const turnstileRequiredAtBuild =
  configEnvironment.VERCEL_ENV === 'production' ||
  configEnvironment.NEWSLETTER_TURNSTILE_MODE === 'required';

if (turnstileRequiredAtBuild && !configEnvironment.PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY?.trim()) {
  throw new Error('PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY is required when Turnstile is required.');
}

const contentSecurityPolicy =
  cspMode === 'enforce'
    ? {
        directives: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "font-src 'self' data:",
          "img-src 'self' data: blob:",
          "media-src 'self'",
          "connect-src 'self' https://challenges.cloudflare.com",
          'frame-src https://chatdb.io https://www.chatdb.io https://challenges.cloudflare.com',
        ],
        scriptDirective: {
          resources: ["'self'", 'https://challenges.cloudflare.com'],
        },
        styleDirective: {
          resources: [
            { resource: "'self'", kind: 'element' },
            { resource: "'unsafe-inline'", kind: 'attribute' },
          ],
        },
      }
    : false;

export default defineConfig({
  integrations: [react(), mdx()],
  site: 'https://www.alexgodfrey.com',
  trailingSlash: 'never',
  redirects: {
    '/old': {
      destination: '/',
      status: 308,
    },
    '/blog/ai': {
      destination: '/',
      status: 308,
    },
    '/blog/ascorbic-acid-ph': {
      destination: '/blog/red-bull',
      status: 308,
    },
  },
  logger: configEnvironment.ASTRO_LOG_FORMAT === 'json' ? logHandlers.json() : undefined,
  // Shiki emits inline token styles that cannot be covered by Astro's generated
  // CSP hashes. Prism uses classes and remains compatible with enforcement.
  markdown: {
    syntaxHighlight: 'prism',
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Aspekta',
      cssVariable: '--font-aspekta',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/Aspekta-400.woff2'],
            weight: 400,
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/Aspekta-500.woff2'],
            weight: 500,
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/Aspekta-600.woff2'],
            weight: 600,
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/Aspekta-900.woff2'],
            weight: 900,
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Berkeley Mono',
      cssVariable: '--font-berkeley-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/BerkeleyMono.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],

  vite: {
    // Three.js is isolated to the deferred /test canvas island; keep its
    // intentionally self-contained chunk from producing a false-positive warning.
    build: {
      chunkSizeWarningLimit: 600,
    },
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      CHATDB_URL: envField.string({ context: 'client', access: 'public' }),
      AGENTDB_API_URL: envField.string({ context: 'server', access: 'public' }),
      AGENTDB_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      NEWSLETTER_TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      NEWSLETTER_RATE_LIMIT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      NEWSLETTER_ALLOWED_ORIGINS: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      NEWSLETTER_TURNSTILE_MODE: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
    },
  },

  security: {
    checkOrigin: true,
    csp: contentSecurityPolicy,
  },

  cache: {
    provider: cacheVercel(),
  },

  output: 'server',
  adapter: vercel({ staticHeaders: true }),
});
