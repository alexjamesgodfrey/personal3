export type TurnstileMode = 'required' | 'optional';

export type NewsletterSecurityConfig = {
  allowedOrigins: string[];
  isProduction: boolean;
  rateLimitSecret: string;
  turnstileMode: TurnstileMode;
  turnstileSecret?: string;
};

export class NewsletterConfigurationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'NewsletterConfigurationError';
  }
}

type Environment = Record<string, string | undefined>;

function parseAllowedOrigins(value: string | undefined, requireHttps: boolean): string[] {
  if (!value?.trim()) return [];

  return value.split(',').map((candidate) => {
    const trimmed = candidate.trim();
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new NewsletterConfigurationError('invalid_allowed_origin');
    }

    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      (requireHttps && url.protocol !== 'https:') ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new NewsletterConfigurationError('invalid_allowed_origin');
    }

    return url.origin;
  });
}

export function getNewsletterSecurityConfig(
  environment: Environment = process.env,
): NewsletterSecurityConfig {
  const isProduction =
    environment.NODE_ENV === 'production' || environment.VERCEL_ENV === 'production';
  const configuredMode = environment.NEWSLETTER_TURNSTILE_MODE?.trim().toLowerCase();

  if (
    configuredMode !== undefined &&
    configuredMode !== 'required' &&
    configuredMode !== 'optional'
  ) {
    throw new NewsletterConfigurationError('invalid_turnstile_mode');
  }

  if (isProduction && configuredMode === 'optional') {
    throw new NewsletterConfigurationError('turnstile_must_be_required_in_production');
  }

  const turnstileMode: TurnstileMode = isProduction
    ? 'required'
    : ((configuredMode as TurnstileMode | undefined) ?? 'optional');
  const turnstileSecret = environment.NEWSLETTER_TURNSTILE_SECRET_KEY?.trim();

  if (turnstileMode === 'required' && !turnstileSecret) {
    throw new NewsletterConfigurationError('missing_turnstile_secret');
  }

  const configuredRateLimitSecret = environment.NEWSLETTER_RATE_LIMIT_SECRET?.trim();
  if (configuredRateLimitSecret && configuredRateLimitSecret.length < 32) {
    throw new NewsletterConfigurationError('weak_rate_limit_secret');
  }
  if (isProduction && !configuredRateLimitSecret) {
    throw new NewsletterConfigurationError('missing_rate_limit_secret');
  }

  return {
    allowedOrigins: parseAllowedOrigins(environment.NEWSLETTER_ALLOWED_ORIGINS, isProduction),
    isProduction,
    rateLimitSecret: configuredRateLimitSecret ?? 'newsletter-development-only-rate-limit-secret',
    turnstileMode,
    turnstileSecret,
  };
}
