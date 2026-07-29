import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response('This resource has been permanently removed.\n', {
    status: 410,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=86400',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, noarchive',
    },
  });
