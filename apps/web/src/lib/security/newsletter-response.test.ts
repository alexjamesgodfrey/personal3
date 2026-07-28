import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NewsletterRequestError } from './newsletter-request';
import {
  newsletterErrorResponse,
  newsletterSuccessResponse,
  NewsletterSecurityError,
} from './newsletter-response';

describe('newsletter responses', () => {
  it('never returns subscriber state or email addresses on success', async () => {
    const response = newsletterSuccessResponse('subscribe', 'request-123');
    const text = await response.text();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-request-id'), 'request-123');
    assert.doesNotMatch(text, /subscriber|person@example\.com|welcomeStatus/);
  });

  it('does not expose validation details or internal errors', async () => {
    const validation = newsletterErrorResponse(
      new NewsletterRequestError(400, 'invalid_payload'),
      'request-123',
    );
    assert.equal(validation.status, 400);
    assert.doesNotMatch(await validation.text(), /invalid_payload/);

    const dependency = newsletterErrorResponse(
      new Error('database password or query detail'),
      'request-456',
    );
    assert.equal(dependency.status, 503);
    assert.doesNotMatch(await dependency.text(), /password|query detail/);
  });

  it('adds Retry-After for distributed limiter failures', () => {
    const response = newsletterErrorResponse(
      new NewsletterSecurityError(429, 'address_rate_limit_exceeded', 42),
      'request-123',
    );
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('retry-after'), '42');
  });
});
