import { renderAboutMarkdown } from '@alexgodfrey/web/lib/agent-documents';
import { markdownResponse } from '@alexgodfrey/web/lib/agent-http';
import { getPublishedNotes } from '@alexgodfrey/web/lib/published-notes';
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = async () =>
  markdownResponse(renderAboutMarkdown(await getPublishedNotes()), '/');
