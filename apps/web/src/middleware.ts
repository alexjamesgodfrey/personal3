import { defineMiddleware } from 'astro:middleware';
import { applySecurityHeaders } from './lib/http-security';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);

  applySecurityHeaders(headers, context.url.protocol === 'https:');

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
});
