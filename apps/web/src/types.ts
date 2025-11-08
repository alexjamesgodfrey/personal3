import { reference, z } from 'astro:content';

export const noteFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  relatedPosts: z.array(reference('note')),
});

// infer the noteFrontmatterType
export type NoteFrontmatterType = z.infer<typeof noteFrontmatterSchema>;

export interface Cell {
  id: string;
  width: number; // 1-4 (column span out of 4)
  height: number; // pixel height
}
