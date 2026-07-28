import { randomUUID } from 'node:crypto';
import type { TurnstileMode } from './newsletter-config';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_TIMEOUT_MS = 5_000;

type TurnstileResponse = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
};

export type TurnstileVerification = {
  ok: boolean;
  reason?:
    | 'missing_token'
    | 'missing_secret'
    | 'verification_unavailable'
    | 'challenge_rejected'
    | 'hostname_mismatch'
    | 'action_mismatch';
};

type VerifyTurnstileOptions = {
  expectedAction: string;
  expectedHostnames: readonly string[];
  fetchImpl?: typeof fetch;
  mode: TurnstileMode;
  remoteAddress?: string;
  secret?: string;
  token?: string;
};

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

export async function verifyNewsletterTurnstile({
  expectedAction,
  expectedHostnames,
  fetchImpl = fetch,
  mode,
  remoteAddress,
  secret,
  token,
}: VerifyTurnstileOptions): Promise<TurnstileVerification> {
  if (!token) {
    return mode === 'optional' ? { ok: true } : { ok: false, reason: 'missing_token' };
  }

  if (!secret) {
    return mode === 'optional' ? { ok: true } : { ok: false, reason: 'missing_secret' };
  }

  const form = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: randomUUID(),
  });
  if (remoteAddress && remoteAddress !== 'unknown') {
    form.set('remoteip', remoteAddress);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);

  let response: Response;
  let result: TurnstileResponse;
  try {
    response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, reason: 'verification_unavailable' };
    }
    result = (await response.json()) as TurnstileResponse;
  } catch {
    return { ok: false, reason: 'verification_unavailable' };
  } finally {
    clearTimeout(timeout);
  }

  if (result.success !== true) {
    return { ok: false, reason: 'challenge_rejected' };
  }

  if (typeof result.hostname !== 'string') {
    return { ok: false, reason: 'hostname_mismatch' };
  }
  const hostname = normalizeHostname(result.hostname);
  const allowedHostnames = new Set(expectedHostnames.map(normalizeHostname));
  if (!allowedHostnames.has(hostname)) {
    return { ok: false, reason: 'hostname_mismatch' };
  }

  if (result.action !== expectedAction) {
    return { ok: false, reason: 'action_mismatch' };
  }

  return { ok: true };
}
