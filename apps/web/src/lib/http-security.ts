export const REPORT_ONLY_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com",
  'frame-src https://chatdb.io https://www.chatdb.io https://challenges.cloudflare.com',
].join('; ');

export function applySecurityHeaders(headers: Headers, isSecureRequest: boolean): void {
  headers.set('Content-Security-Policy-Report-Only', REPORT_ONLY_CONTENT_SECURITY_POLICY);
  headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), browsing-topics=()');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');

  if (isSecureRequest) {
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
}
