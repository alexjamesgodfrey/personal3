import { textResponse } from '@alexgodfrey/web/lib/agent-http';
import { getPublishedNotes, publishedNoteSlug } from '@alexgodfrey/web/lib/published-notes';
import { absoluteUrl, PROFILE_LAST_UPDATED } from '@alexgodfrey/web/lib/site-content';
import type { APIRoute } from 'astro';

export const prerender = true;

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = async () => {
  const notes = await getPublishedNotes();
  const urls = [
    { path: '/', lastModified: PROFILE_LAST_UPDATED, priority: '1.0' },
    { path: '/contact', lastModified: PROFILE_LAST_UPDATED, priority: '0.7' },
    { path: '/newsletter', lastModified: PROFILE_LAST_UPDATED, priority: '0.6' },
    ...notes.map((note) => {
      const slug = publishedNoteSlug(note);
      const lastModified = (note.data.updatedDate ?? note.data.pubDate).toISOString().split('T')[0];
      return { path: `/blog/${slug}`, lastModified, priority: '0.8' };
    }),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastModified, priority }) => `  <url>
    <loc>${escapeXml(absoluteUrl(path))}</loc>
    <lastmod>${lastModified}</lastmod>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return textResponse(body, 'application/xml; charset=utf-8');
};
