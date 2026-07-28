import { textResponse } from '@alexgodfrey/web/lib/agent-http';
import { getPublishedNotes, publishedNoteSlug } from '@alexgodfrey/web/lib/published-notes';
import { absoluteUrl, siteContent, SITE_ORIGIN } from '@alexgodfrey/web/lib/site-content';
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
  const lastBuildDate = notes[0]?.data.updatedDate ?? notes[0]?.data.pubDate ?? new Date();
  const items = notes
    .map((note) => {
      const url = absoluteUrl(`/blog/${publishedNoteSlug(note)}`);
      return `    <item>
      <title>${escapeXml(note.data.title)}</title>
      <description>${escapeXml(note.data.description)}</description>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${note.data.pubDate.toUTCString()}</pubDate>
      <author>${escapeXml(`${siteContent.contact[0].display} (${siteContent.name})`)}</author>
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteContent.name}</title>
    <description>${escapeXml(siteContent.description)}</description>
    <link>${SITE_ORIGIN}/</link>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${SITE_ORIGIN}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return textResponse(feed, 'application/rss+xml; charset=utf-8');
};
