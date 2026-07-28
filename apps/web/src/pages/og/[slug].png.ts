import {
  noteSlugFromId,
  type NoteSocialImageData,
} from '@alexgodfrey/web/lib/og/note-social-image';
import { renderNoteSocialImage } from '@alexgodfrey/web/lib/og/social-image';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

interface SocialImageProps {
  socialImage: NoteSocialImageData;
}

export const getStaticPaths = (async () => {
  const notes = await getCollection('notes');

  return notes.map((note) => {
    const slug = noteSlugFromId(note.id);
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
