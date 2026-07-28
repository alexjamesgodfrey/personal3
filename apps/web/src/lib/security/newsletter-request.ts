import { isIP } from 'node:net';
import { z } from 'astro/zod';

export const MAX_NEWSLETTER_BODY_BYTES = 4_096;

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/u;
const SAFE_NAME_PATTERN = /^[\p{L}\p{M} .'-]*$/u;
const JSON_MEDIA_TYPE = 'application/json';

const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

const nameSchema = z
  .string()
  .trim()
  .max(80)
  .refine((value) => !CONTROL_CHARACTER_PATTERN.test(value) && SAFE_NAME_PATTERN.test(value))
  .transform((value) => value || undefined)
  .optional();

const honeypotSchema = z.string().max(200).optional().default('');
const turnstileTokenSchema = z.string().trim().min(1).max(2_048).optional();

const challengeFields = {
  website: honeypotSchema,
  turnstileToken: turnstileTokenSchema,
  'cf-turnstile-response': turnstileTokenSchema,
};

const subscribeSchema = z
  .object({
    email: emailSchema,
    name: nameSchema,
    ...challengeFields,
  })
  .strict()
  .refine(
    (value) =>
      !value.turnstileToken ||
      !value['cf-turnstile-response'] ||
      value.turnstileToken === value['cf-turnstile-response'],
  )
  .transform((value) => ({
    email: value.email,
    name: value.name,
    honeypot: value.website.trim(),
    turnstileToken: value.turnstileToken ?? value['cf-turnstile-response'],
  }));

const unsubscribeSchema = z
  .object({
    email: emailSchema,
    ...challengeFields,
  })
  .strict()
  .refine(
    (value) =>
      !value.turnstileToken ||
      !value['cf-turnstile-response'] ||
      value.turnstileToken === value['cf-turnstile-response'],
  )
  .transform((value) => ({
    email: value.email,
    honeypot: value.website.trim(),
    turnstileToken: value.turnstileToken ?? value['cf-turnstile-response'],
  }));

export type NewsletterAction = 'subscribe' | 'unsubscribe';
export type SubscribeRequest = z.infer<typeof subscribeSchema>;
export type UnsubscribeRequest = z.infer<typeof unsubscribeSchema>;
export type NewsletterRequest = SubscribeRequest | UnsubscribeRequest;

export class NewsletterRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.name = 'NewsletterRequestError';
    this.status = status;
    this.code = code;
  }
}

function assertJsonRequest(request: Request): void {
  const contentEncoding = request.headers.get('content-encoding')?.trim().toLowerCase();
  if (contentEncoding && contentEncoding !== 'identity') {
    throw new NewsletterRequestError(415, 'unsupported_content_encoding');
  }

  const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();

  if (mediaType !== JSON_MEDIA_TYPE) {
    throw new NewsletterRequestError(415, 'unsupported_media_type');
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      throw new NewsletterRequestError(400, 'invalid_content_length');
    }

    if (Number(contentLength) > MAX_NEWSLETTER_BODY_BYTES) {
      throw new NewsletterRequestError(413, 'request_too_large');
    }
  }
}

async function readLimitedBody(request: Request): Promise<string> {
  if (!request.body) {
    throw new NewsletterRequestError(400, 'empty_body');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      byteLength += value.byteLength;
      if (byteLength > MAX_NEWSLETTER_BODY_BYTES) {
        await reader.cancel();
        throw new NewsletterRequestError(413, 'request_too_large');
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (byteLength === 0) {
    throw new NewsletterRequestError(400, 'empty_body');
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new NewsletterRequestError(400, 'invalid_utf8');
  }
}

export async function parseNewsletterRequest(
  request: Request,
  action: 'subscribe',
): Promise<SubscribeRequest>;
export async function parseNewsletterRequest(
  request: Request,
  action: 'unsubscribe',
): Promise<UnsubscribeRequest>;
export async function parseNewsletterRequest(
  request: Request,
  action: NewsletterAction,
): Promise<NewsletterRequest>;
export async function parseNewsletterRequest(
  request: Request,
  action: NewsletterAction,
): Promise<NewsletterRequest> {
  assertJsonRequest(request);

  let body: unknown;
  try {
    body = JSON.parse(await readLimitedBody(request));
  } catch (error) {
    if (error instanceof NewsletterRequestError) throw error;
    throw new NewsletterRequestError(400, 'invalid_json');
  }

  const result =
    action === 'subscribe' ? subscribeSchema.safeParse(body) : unsubscribeSchema.safeParse(body);

  if (!result.success) {
    throw new NewsletterRequestError(400, 'invalid_payload');
  }

  return result.data;
}

function parseOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function assertNewsletterOrigin(
  request: Request,
  configuredOrigins: readonly string[] = [],
): void {
  const originHeader = request.headers.get('origin');
  if (!originHeader || originHeader === 'null') {
    throw new NewsletterRequestError(403, 'origin_required');
  }

  const origin = parseOrigin(originHeader);
  if (!origin) {
    throw new NewsletterRequestError(403, 'invalid_origin');
  }

  const allowedOrigins = new Set<string>([new URL(request.url).origin]);
  for (const configuredOrigin of configuredOrigins) {
    const parsed = parseOrigin(configuredOrigin);
    if (parsed) allowedOrigins.add(parsed);
  }

  if (!allowedOrigins.has(origin)) {
    throw new NewsletterRequestError(403, 'cross_origin_request');
  }

  const fetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase();
  if (
    fetchSite &&
    fetchSite !== 'same-origin' &&
    fetchSite !== 'same-site' &&
    fetchSite !== 'none'
  ) {
    throw new NewsletterRequestError(403, 'cross_site_request');
  }
}

function normalizeAddress(candidate: string | undefined): string | null {
  if (!candidate) return null;

  let value = candidate.trim().toLowerCase();
  if (value.startsWith('[') && value.endsWith(']')) {
    value = value.slice(1, -1);
  }
  if (value.startsWith('::ffff:') && isIP(value.slice(7)) === 4) {
    value = value.slice(7);
  }

  return isIP(value) ? value : null;
}

export function getNewsletterClientAddress(request: Request, astroClientAddress?: string): string {
  const fromAstro = normalizeAddress(astroClientAddress);
  if (fromAstro) return fromAstro;

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',', 1)[0];
  return normalizeAddress(forwardedFor) ?? 'unknown';
}
