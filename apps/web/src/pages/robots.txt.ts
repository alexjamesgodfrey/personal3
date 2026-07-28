import { textResponse } from '@alexgodfrey/web/lib/agent-http';
import { SITE_ORIGIN } from '@alexgodfrey/web/lib/site-content';
import type { APIRoute } from 'astro';

export const prerender = true;

const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_server-islands/

User-agent: OAI-SearchBot
Allow: /
Disallow: /api/
Disallow: /_server-islands/

Sitemap: ${SITE_ORIGIN}/sitemap.xml`;

export const GET: APIRoute = () => textResponse(robots);
