import { noteFrontmatterSchema } from '@alexgodfrey/web/types';
import type { z } from 'astro:content';

export function validateNote(note: unknown): z.infer<typeof noteFrontmatterSchema> {
  return noteFrontmatterSchema.parse(note);
}
