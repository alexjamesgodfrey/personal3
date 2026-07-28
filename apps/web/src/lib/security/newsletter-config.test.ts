import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getNewsletterSecurityConfig, NewsletterConfigurationError } from './newsletter-config';

const strongSecret = 'a-secret-value-that-is-longer-than-thirty-two-characters';

describe('getNewsletterSecurityConfig', () => {
  it('requires both Turnstile and HMAC secrets in production', () => {
    assert.throws(
      () => getNewsletterSecurityConfig({ NODE_ENV: 'production' }),
      (error: unknown) =>
        error instanceof NewsletterConfigurationError && error.code === 'missing_turnstile_secret',
    );

    assert.throws(
      () =>
        getNewsletterSecurityConfig({
          NODE_ENV: 'production',
          NEWSLETTER_TURNSTILE_SECRET_KEY: 'turnstile-secret',
        }),
      (error: unknown) =>
        error instanceof NewsletterConfigurationError && error.code === 'missing_rate_limit_secret',
    );
  });

  it('cannot be silently switched to optional Turnstile in production', () => {
    assert.throws(
      () =>
        getNewsletterSecurityConfig({
          NODE_ENV: 'production',
          NEWSLETTER_RATE_LIMIT_SECRET: strongSecret,
          NEWSLETTER_TURNSTILE_MODE: 'optional',
          NEWSLETTER_TURNSTILE_SECRET_KEY: 'turnstile-secret',
        }),
      (error: unknown) =>
        error instanceof NewsletterConfigurationError &&
        error.code === 'turnstile_must_be_required_in_production',
    );
  });

  it('supports optional Turnstile for local development only', () => {
    const config = getNewsletterSecurityConfig({ NODE_ENV: 'development' });
    assert.equal(config.isProduction, false);
    assert.equal(config.turnstileMode, 'optional');
    assert.match(config.rateLimitSecret, /development-only/);
  });

  it('rejects weak pseudonymization secrets and malformed allowed origins', () => {
    assert.throws(
      () =>
        getNewsletterSecurityConfig({
          NEWSLETTER_RATE_LIMIT_SECRET: 'short',
        }),
      (error: unknown) =>
        error instanceof NewsletterConfigurationError && error.code === 'weak_rate_limit_secret',
    );

    assert.throws(
      () =>
        getNewsletterSecurityConfig({
          NEWSLETTER_ALLOWED_ORIGINS: 'https://alexgodfrey.com/path',
        }),
      (error: unknown) =>
        error instanceof NewsletterConfigurationError && error.code === 'invalid_allowed_origin',
    );

    assert.throws(
      () =>
        getNewsletterSecurityConfig({
          NODE_ENV: 'production',
          NEWSLETTER_ALLOWED_ORIGINS: 'http://alexgodfrey.com',
          NEWSLETTER_RATE_LIMIT_SECRET: strongSecret,
          NEWSLETTER_TURNSTILE_SECRET_KEY: 'turnstile-secret',
        }),
      (error: unknown) =>
        error instanceof NewsletterConfigurationError && error.code === 'invalid_allowed_origin',
    );
  });
});
