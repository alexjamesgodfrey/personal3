import type { APIRoute } from 'astro';
import { unsubscribeFromNewsletter } from '../../../lib/newsletter-db';
import { guardNewsletterRequest } from '../../../lib/security/newsletter-guard';
import {
  classifyNewsletterFailure,
  logNewsletterFailure,
  newsletterErrorResponse,
  newsletterRequestId,
  newsletterSuccessResponse,
} from '../../../lib/security/newsletter-response';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const requestId = newsletterRequestId(context.request);
  try {
    const guarded = await guardNewsletterRequest(context, 'unsubscribe');
    if (!guarded.shortCircuit) {
      await unsubscribeFromNewsletter(guarded.payload.email, 'self-service');
    }
    return newsletterSuccessResponse('unsubscribe', requestId);
  } catch (error) {
    logNewsletterFailure({
      action: 'unsubscribe',
      category: classifyNewsletterFailure(error),
      requestId,
    });
    return newsletterErrorResponse(error, requestId);
  }
};
