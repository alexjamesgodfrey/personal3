import { noteSlugFromId } from '@alexgodfrey/web/lib/og/note-social-image';
import { getCollection, type CollectionEntry } from 'astro:content';

export type PublishedNote = CollectionEntry<'notes'>;

export async function getPublishedNotes(): Promise<PublishedNote[]> {
  const notes = await getCollection('notes', ({ data }) => !data.draft);

  return notes.sort((left, right) => right.data.pubDate.getTime() - left.data.pubDate.getTime());
}

export function publishedNoteSlug(note: PublishedNote): string {
  return noteSlugFromId(note.id);
}
