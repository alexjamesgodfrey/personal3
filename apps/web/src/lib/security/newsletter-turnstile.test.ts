import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { verifyNewsletterTurnstile } from './newsletter-turnstile';

const successfulFetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  assert.equal(init?.method, 'POST');
  assert.match(String(init?.body), /secret=server-secret/);
  assert.match(String(init?.body), /response=browser-token/);
  return Response.json({
    success: true,
    hostname: 'alexgodfrey.com',
    action: 'newsletter_subscribe',
  });
}) as typeof fetch;

describe('verifyNewsletterTurnstile', () => {
  it('fails closed when a required token is missing', async () => {
    const result = await verifyNewsletterTurnstile({
      expectedAction: 'newsletter_subscribe',
      expectedHostnames: ['alexgodfrey.com'],
      fetchImpl: successfulFetch,
      mode: 'required',
      secret: 'server-secret',
    });
    assert.deepEqual(result, { ok: false, reason: 'missing_token' });
  });

  it('allows a missing token only in explicitly optional development mode', async () => {
    const result = await verifyNewsletterTurnstile({
      expectedAction: 'newsletter_subscribe',
      expectedHostnames: ['localhost'],
      mode: 'optional',
    });
    assert.deepEqual(result, { ok: true });
  });

  it('binds a successful challenge to the hostname and endpoint action', async () => {
    const result = await verifyNewsletterTurnstile({
      expectedAction: 'newsletter_subscribe',
      expectedHostnames: ['alexgodfrey.com'],
      fetchImpl: successfulFetch,
      mode: 'required',
      remoteAddress: '192.0.2.1',
      secret: 'server-secret',
      token: 'browser-token',
    });
    assert.deepEqual(result, { ok: true });
  });

  it('rejects tokens issued for another action or hostname', async () => {
    const actionMismatch = await verifyNewsletterTurnstile({
      expectedAction: 'newsletter_unsubscribe',
      expectedHostnames: ['alexgodfrey.com'],
      fetchImpl: successfulFetch,
      mode: 'required',
      secret: 'server-secret',
      token: 'browser-token',
    });
    assert.deepEqual(actionMismatch, { ok: false, reason: 'action_mismatch' });

    const hostnameMismatch = await verifyNewsletterTurnstile({
      expectedAction: 'newsletter_subscribe',
      expectedHostnames: ['preview.example'],
      fetchImpl: successfulFetch,
      mode: 'required',
      secret: 'server-secret',
      token: 'browser-token',
    });
    assert.deepEqual(hostnameMismatch, { ok: false, reason: 'hostname_mismatch' });
  });

  it('fails closed when Cloudflare is unavailable', async () => {
    const unavailableFetch = (async () => {
      throw new Error('sensitive upstream detail');
    }) as typeof fetch;
    const result = await verifyNewsletterTurnstile({
      expectedAction: 'newsletter_subscribe',
      expectedHostnames: ['alexgodfrey.com'],
      fetchImpl: unavailableFetch,
      mode: 'required',
      secret: 'server-secret',
      token: 'browser-token',
    });
    assert.deepEqual(result, { ok: false, reason: 'verification_unavailable' });
  });
});
