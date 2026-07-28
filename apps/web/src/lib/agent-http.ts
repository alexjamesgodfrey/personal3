import { absoluteUrl } from '@alexgodfrey/web/lib/site-content';

export function markdownResponse(markdown: string, canonicalPath: string): Response {
  return new Response(`${markdown.trim()}\n`, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Disposition': 'inline',
      'Content-Language': 'en-US',
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${absoluteUrl(canonicalPath)}>; rel="canonical"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function textResponse(text: string, contentType = 'text/plain; charset=utf-8'): Response {
  return new Response(`${text.trim()}\n`, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
