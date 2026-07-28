import { renderContactMarkdown } from '@alexgodfrey/web/lib/agent-documents';
import { markdownResponse } from '@alexgodfrey/web/lib/agent-http';
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () => markdownResponse(renderContactMarkdown(), '/contact');
