import { createHmac } from 'node:crypto';

export function hashNewsletterIdentifier(
  secret: string,
  namespace: string,
  identifier: string,
): string {
  return createHmac('sha256', secret)
    .update(namespace)
    .update('\0')
    .update(identifier)
    .digest('hex');
}
