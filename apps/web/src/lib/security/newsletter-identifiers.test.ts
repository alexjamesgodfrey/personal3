import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashNewsletterIdentifier } from './newsletter-identifiers';

describe('hashNewsletterIdentifier', () => {
  it('is stable, namespaced, and does not store the underlying PII', () => {
    const secret = 'a-secret-value-that-is-longer-than-thirty-two-characters';
    const first = hashNewsletterIdentifier(secret, 'subscribe:email', 'person@example.com');
    const same = hashNewsletterIdentifier(secret, 'subscribe:email', 'person@example.com');
    const otherNamespace = hashNewsletterIdentifier(
      secret,
      'unsubscribe:email',
      'person@example.com',
    );

    assert.equal(first, same);
    assert.notEqual(first, otherNamespace);
    assert.doesNotMatch(first, /person|example/);
    assert.match(first, /^[a-f0-9]{64}$/);
  });
});
