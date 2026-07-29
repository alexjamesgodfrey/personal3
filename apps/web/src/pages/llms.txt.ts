import { renderLlmsTxt } from '@alexgodfrey/web/lib/agent-documents';
import { textResponse } from '@alexgodfrey/web/lib/agent-http';
import { getPublishedNotes } from '@alexgodfrey/web/lib/published-notes';
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = async () =>
  textResponse(renderLlmsTxt(await getPublishedNotes()), 'text/markdown; charset=utf-8', {
    'X-Robots-Tag': 'noindex, follow',
  });
