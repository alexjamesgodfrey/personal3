import type { APIContext } from 'astro';
import {
  NEWSLETTER_ALLOWED_ORIGINS,
  NEWSLETTER_RATE_LIMIT_SECRET,
  NEWSLETTER_TURNSTILE_MODE,
  NEWSLETTER_TURNSTILE_SECRET_KEY,
} from 'astro:env/server';
import { getNewsletterSecurityConfig } from './newsletter-config';
import { hashNewsletterIdentifier } from './newsletter-identifiers';
import {
  assertNewsletterOrigin,
  getNewsletterClientAddress,
  parseNewsletterRequest,
  type NewsletterAction,
  type SubscribeRequest,
  type UnsubscribeRequest,
} from './newsletter-request';
import {
  consumeNewsletterRateLimit,
  type NewsletterRateLimitPolicy,
} from './newsletter-rate-limit';
import { expectedTurnstileHostnames, NewsletterSecurityError } from './newsletter-response';
import { verifyNewsletterTurnstile } from './newsletter-turnstile';

const RATE_LIMITS: Record<
  NewsletterAction,
  { address: NewsletterRateLimitPolicy; email: NewsletterRateLimitPolicy }
> = {
  subscribe: {
    address: { limit: 8, windowSeconds: 10 * 60 },
    email: { limit: 3, windowSeconds: 60 * 60 },
  },
  unsubscribe: {
    address: { limit: 12, windowSeconds: 10 * 60 },
    email: { limit: 5, windowSeconds: 60 * 60 },
  },
};

export type NewsletterGuardResult<T extends SubscribeRequest | UnsubscribeRequest> = {
  clientAddress: string;
  payload: T;
  shortCircuit: boolean;
};

function readAstroClientAddress(context: APIContext): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    return undefined;
  }
}

export async function guardNewsletterRequest(
  context: APIContext,
  action: 'subscribe',
): Promise<NewsletterGuardResult<SubscribeRequest>>;
export async function guardNewsletterRequest(
  context: APIContext,
  action: 'unsubscribe',
): Promise<NewsletterGuardResult<UnsubscribeRequest>>;
export async function guardNewsletterRequest(
  context: APIContext,
  action: NewsletterAction,
): Promise<NewsletterGuardResult<SubscribeRequest | UnsubscribeRequest>> {
  const config = getNewsletterSecurityConfig({
    ...process.env,
    NEWSLETTER_ALLOWED_ORIGINS,
    NEWSLETTER_RATE_LIMIT_SECRET,
    NEWSLETTER_TURNSTILE_MODE,
    NEWSLETTER_TURNSTILE_SECRET_KEY,
  });
  assertNewsletterOrigin(context.request, config.allowedOrigins);
  const payload = await parseNewsletterRequest(context.request, action);
  const clientAddress = getNewsletterClientAddress(
    context.request,
    readAstroClientAddress(context),
  );
  const policy = RATE_LIMITS[action];

  let addressLimit;
  try {
    addressLimit = await consumeNewsletterRateLimit(
      hashNewsletterIdentifier(config.rateLimitSecret, `${action}:address`, clientAddress),
      policy.address,
    );
  } catch {
    throw new NewsletterSecurityError(503, 'rate_limiter_unavailable', 60);
  }
  if (!addressLimit.allowed) {
    throw new NewsletterSecurityError(429, 'address_rate_limit_exceeded', addressLimit.retryAfter);
  }

  if (payload.honeypot) {
    return { clientAddress, payload, shortCircuit: true };
  }

  const turnstile = await verifyNewsletterTurnstile({
    expectedAction: `newsletter_${action}`,
    expectedHostnames: expectedTurnstileHostnames(context.request, config),
    mode: config.turnstileMode,
    remoteAddress: clientAddress,
    secret: config.turnstileSecret,
    token: payload.turnstileToken,
  });
  if (!turnstile.ok) {
    const unavailable = turnstile.reason === 'verification_unavailable';
    throw new NewsletterSecurityError(
      unavailable ? 503 : 403,
      `turnstile_${turnstile.reason ?? 'rejected'}`,
      unavailable ? 60 : undefined,
    );
  }

  let emailLimit;
  try {
    emailLimit = await consumeNewsletterRateLimit(
      hashNewsletterIdentifier(config.rateLimitSecret, `${action}:email`, payload.email),
      policy.email,
    );
  } catch {
    throw new NewsletterSecurityError(503, 'rate_limiter_unavailable', 60);
  }

  // Repeated requests for a specific address intentionally receive the ordinary
  // success response. Returning 429 here would disclose whether an address has
  // recently interacted with the list.
  if (!emailLimit.allowed) {
    return { clientAddress, payload, shortCircuit: true };
  }

  return { clientAddress, payload, shortCircuit: false };
}
