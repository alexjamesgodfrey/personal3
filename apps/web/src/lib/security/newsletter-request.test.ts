import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertNewsletterOrigin,
  getNewsletterClientAddress,
  MAX_NEWSLETTER_BODY_BYTES,
  NewsletterRequestError,
  parseNewsletterRequest,
} from './newsletter-request';

function newsletterRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('https://alexgodfrey.com/api/newsletter/subscribe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      origin: 'https://alexgodfrey.com',
      ...headers,
    },
    body,
  });
}

describe('parseNewsletterRequest', () => {
  it('normalizes a valid subscribe payload and accepts the standard Turnstile field', async () => {
    const parsed = await parseNewsletterRequest(
      newsletterRequest(
        JSON.stringify({
          email: '  Person@EXAMPLE.com ',
          name: '  Person  ',
          website: '',
          'cf-turnstile-response': 'challenge-token',
        }),
      ),
      'subscribe',
    );

    assert.deepEqual(parsed, {
      email: 'person@example.com',
      name: 'Person',
      honeypot: '',
      turnstileToken: 'challenge-token',
    });
  });

  it('rejects unknown fields rather than allowing DTO drift', async () => {
    await assert.rejects(
      parseNewsletterRequest(
        newsletterRequest(
          JSON.stringify({
            email: 'person@example.com',
            role: 'admin',
          }),
        ),
        'subscribe',
      ),
      (error: unknown) =>
        error instanceof NewsletterRequestError &&
        error.status === 400 &&
        error.code === 'invalid_payload',
    );
  });

  it('rejects markup in names before it can reach the HTML welcome-email template', async () => {
    await assert.rejects(
      parseNewsletterRequest(
        newsletterRequest(
          JSON.stringify({
            email: 'person@example.com',
            name: '<img src=x onerror=alert(1)>',
          }),
        ),
        'subscribe',
      ),
      (error: unknown) =>
        error instanceof NewsletterRequestError &&
        error.status === 400 &&
        error.code === 'invalid_payload',
    );
  });

  it('rejects non-JSON content before reading the body', async () => {
    await assert.rejects(
      parseNewsletterRequest(
        newsletterRequest('email=person@example.com', {
          'content-type': 'application/x-www-form-urlencoded',
        }),
        'subscribe',
      ),
      (error: unknown) =>
        error instanceof NewsletterRequestError &&
        error.status === 415 &&
        error.code === 'unsupported_media_type',
    );
  });

  it('enforces the streaming body limit when Content-Length is absent', async () => {
    const oversized = JSON.stringify({
      email: 'person@example.com',
      website: 'x'.repeat(MAX_NEWSLETTER_BODY_BYTES),
    });
    const request = newsletterRequest(oversized);
    request.headers.delete('content-length');

    await assert.rejects(
      parseNewsletterRequest(request, 'subscribe'),
      (error: unknown) =>
        error instanceof NewsletterRequestError &&
        error.status === 413 &&
        error.code === 'request_too_large',
    );
  });

  it('rejects malformed JSON without exposing parser details', async () => {
    await assert.rejects(
      parseNewsletterRequest(newsletterRequest('{"email":'), 'subscribe'),
      (error: unknown) =>
        error instanceof NewsletterRequestError &&
        error.status === 400 &&
        error.code === 'invalid_json',
    );
  });
});

describe('assertNewsletterOrigin', () => {
  it('accepts an exact same-origin request', () => {
    const request = newsletterRequest('{}', { 'sec-fetch-site': 'same-origin' });
    assert.doesNotThrow(() => assertNewsletterOrigin(request));
  });

  it('rejects a cross-origin request', () => {
    const request = newsletterRequest('{}', { origin: 'https://attacker.example' });
    assert.throws(
      () => assertNewsletterOrigin(request),
      (error: unknown) =>
        error instanceof NewsletterRequestError && error.code === 'cross_origin_request',
    );
  });

  it('rejects non-origin values and contradictory Fetch Metadata', () => {
    const invalidOrigin = newsletterRequest('{}', {
      origin: 'https://alexgodfrey.com/forged-path',
    });
    assert.throws(
      () => assertNewsletterOrigin(invalidOrigin),
      (error: unknown) =>
        error instanceof NewsletterRequestError && error.code === 'invalid_origin',
    );

    const crossSite = newsletterRequest('{}', { 'sec-fetch-site': 'cross-site' });
    assert.throws(
      () => assertNewsletterOrigin(crossSite),
      (error: unknown) =>
        error instanceof NewsletterRequestError && error.code === 'cross_site_request',
    );
  });
});

describe('getNewsletterClientAddress', () => {
  it('prefers Astro clientAddress and normalizes IPv4-mapped addresses', () => {
    const request = newsletterRequest('{}', {
      'x-forwarded-for': '203.0.113.10',
    });
    assert.equal(getNewsletterClientAddress(request, '::ffff:192.0.2.10'), '192.0.2.10');
  });

  it('uses a fail-secure shared identity when no valid address is available', () => {
    const request = newsletterRequest('{}', { 'x-forwarded-for': 'not-an-ip' });
    assert.equal(getNewsletterClientAddress(request), 'unknown');
  });
});
