import { renderNoteMarkdown } from '@alexgodfrey/web/lib/agent-documents';
import { markdownResponse } from '@alexgodfrey/web/lib/agent-http';
import {
  getPublishedNotes,
  publishedNoteSlug,
  type PublishedNote,
} from '@alexgodfrey/web/lib/published-notes';
import type { APIRoute, GetStaticPaths } from 'astro';

export const prerender = true;

interface MarkdownNoteProps {
  note: PublishedNote;
}

export const getStaticPaths = (async () => {
  const notes = await getPublishedNotes();

  return notes.map((note) => ({
    params: { slug: publishedNoteSlug(note) },
    props: { note },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<MarkdownNoteProps> = ({ props }) => {
  const slug = publishedNoteSlug(props.note);
  return markdownResponse(renderNoteMarkdown(props.note), `/blog/${slug}`);
};
