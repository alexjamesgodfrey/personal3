import { createHash } from 'node:crypto';

const SAFE_NOTE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TITLE_LENGTH = 180;
const MAX_DESCRIPTION_LENGTH = 260;

export interface NoteSocialImageData {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  updatedDate?: string;
}

function normalizeText(value: string, maxLength: number): string {
  return [...value.replace(/\s+/g, ' ').trim()].slice(0, maxLength).join('');
}

function parseDate(value: string): void {
  if (Number.isNaN(new Date(value).getTime())) {
    throw new Error(`Invalid social image date: ${value}`);
  }
}

export function noteSlugFromId(id: string): string {
  const slug = id.replace(/\.(?:md|mdx)$/, '').replace(/\/index$/, '');

  if (!SAFE_NOTE_SLUG.test(slug)) {
    throw new Error(
      `Unsafe note slug "${slug}". Social image slugs must contain only lowercase letters, numbers, and single hyphens.`,
    );
  }

  return slug;
}

export function validateNoteSocialImageData(data: NoteSocialImageData): NoteSocialImageData {
  if (!SAFE_NOTE_SLUG.test(data.slug)) {
    throw new Error(`Unsafe social image slug: ${data.slug}`);
  }

  const title = normalizeText(data.title, MAX_TITLE_LENGTH);
  const description = normalizeText(data.description, MAX_DESCRIPTION_LENGTH);

  if (!title) {
    throw new Error('A social image title is required.');
  }

  if (!description) {
    throw new Error('A social image description is required.');
  }

  parseDate(data.publishedDate);
  if (data.updatedDate) parseDate(data.updatedDate);

  return {
    slug: data.slug,
    title,
    description,
    publishedDate: data.publishedDate,
    updatedDate: data.updatedDate,
  };
}

export function socialImageVersion(rawData: NoteSocialImageData): string {
  const data = validateNoteSocialImageData(rawData);
  return createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 12);
}
