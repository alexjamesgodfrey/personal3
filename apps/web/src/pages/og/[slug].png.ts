import { type NoteSocialImageData } from '@alexgodfrey/web/lib/og/note-social-image';
import { getPublishedNotes, publishedNoteSlug } from '@alexgodfrey/web/lib/published-notes';
import { renderNoteSocialImage } from '@alexgodfrey/web/lib/og/social-image';
import type { APIRoute, GetStaticPaths } from 'astro';

export const prerender = true;

interface SocialImageProps {
  socialImage: NoteSocialImageData;
}

export const getStaticPaths = (async () => {
  const notes = await getPublishedNotes();

  return notes.map((note) => {
    const slug = publishedNoteSlug(note);
    const socialImage: NoteSocialImageData = {
      slug,
      title: note.data.title,
      description: note.data.description,
      publishedDate: note.data.pubDate.toISOString(),
      updatedDate: note.data.updatedDate?.toISOString(),
    };

    return {
      params: { slug },
      props: { socialImage },
    };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute<SocialImageProps> = async ({ props }) => {
  const png = await renderNoteSocialImage(props.socialImage);

  return new Response(new Uint8Array(png), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(png.byteLength),
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
