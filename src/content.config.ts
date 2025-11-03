import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { noteFrontmatterSchema } from "./types";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: noteFrontmatterSchema,
});

export const collections = { notes };
