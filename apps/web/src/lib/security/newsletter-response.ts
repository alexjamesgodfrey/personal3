import { randomUUID } from 'node:crypto';
import { NewsletterConfigurationError, type NewsletterSecurityConfig } from './newsletter-config';
import { NewsletterRequestError } from './newsletter-request';

export type NewsletterSuccessAction = 'subscribe' | 'unsubscribe';

const SUCCESS_MESSAGES: Record<NewsletterSuccessAction, string> = {
  subscribe: 'Thanks. If this address can be subscribed, you will receive an email shortly.',
  unsubscribe: 'If this address was subscribed, it has been unsubscribed.',
};

function responseHeaders(requestId: string, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('Cache-Control', 'no-store');
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Request-Id', requestId);
  return headers;
}

export function newsletterRequestId(request: Request): string {
  const supplied = request.headers.get('x-request-id')?.trim();
  if (supplied && /^[A-Za-z0-9._:-]{8,128}$/.test(supplied)) {
    return supplied;
  }
  return randomUUID();
}

export function newsletterSuccessResponse(
  action: NewsletterSuccessAction,
  requestId: string,
): Response {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: SUCCESS_MESSAGES[action],
    }),
    {
      status: 200,
      headers: responseHeaders(requestId),
    },
  );
}

export function newsletterErrorResponse(error: unknown, requestId: string): Response {
  let status = 503;
  let retryAfter: number | undefined;

  if (error instanceof NewsletterRequestError) {
    status = error.status;
  } else if (error instanceof NewsletterSecurityError) {
    status = error.status;
    retryAfter = error.retryAfter;
  } else if (error instanceof NewsletterConfigurationError) {
    status = 503;
    retryAfter = 60;
  }

  const message =
    status === 429
      ? 'Too many requests. Please try again later.'
      : status >= 500
        ? 'Unable to process this request right now. Please try again later.'
        : 'Unable to process this request.';

  const headers = responseHeaders(
    requestId,
    retryAfter === undefined ? undefined : { 'Retry-After': String(retryAfter) },
  );
  return new Response(JSON.stringify({ status: 'error', error: message }), {
    status,
    headers,
  });
}

export class NewsletterSecurityError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly retryAfter?: number,
  ) {
    super(code);
    this.name = 'NewsletterSecurityError';
  }
}

type SafeLogMetadata = {
  action: NewsletterSuccessAction;
  category: 'configuration' | 'dependency' | 'request' | 'welcome-email';
  requestId: string;
};

export function logNewsletterFailure(metadata: SafeLogMetadata): void {
  // Malformed requests, failed challenges, and ordinary rate-limit denials are
  // attacker-controlled high-volume events. Do not let them become a log-cost
  // amplification vector.
  if (metadata.category === 'request') return;
  console.error('newsletter-request-failed', metadata);
}

export function classifyNewsletterFailure(error: unknown): SafeLogMetadata['category'] {
  if (error instanceof NewsletterConfigurationError) return 'configuration';
  if (error instanceof NewsletterRequestError) return 'request';
  if (error instanceof NewsletterSecurityError && error.status < 500) return 'request';
  return 'dependency';
}

export function expectedTurnstileHostnames(
  request: Request,
  config: Pick<NewsletterSecurityConfig, 'allowedOrigins'>,
): string[] {
  const hostnames = new Set<string>([new URL(request.url).hostname]);
  for (const origin of config.allowedOrigins) {
    hostnames.add(new URL(origin).hostname);
  }
  return [...hostnames];
}
