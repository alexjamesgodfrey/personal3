import type { APIRoute } from 'astro';
import { sendWelcomeEmail } from '../../../lib/email';
import { subscribeToNewsletter } from '../../../lib/newsletter-db';
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
    const guarded = await guardNewsletterRequest(context, 'subscribe');
    if (guarded.shortCircuit) {
      return newsletterSuccessResponse('subscribe', requestId);
    }

    const { subscriber, isNew } = await subscribeToNewsletter(
      guarded.payload.email,
      guarded.payload.name,
      'newsletter-page',
    );
    if (isNew) {
      const welcome = await sendWelcomeEmail({
        to: subscriber.email,
        name: guarded.payload.name,
      });
      if (welcome.status === 'error') {
        logNewsletterFailure({
          action: 'subscribe',
          category: 'welcome-email',
          requestId,
        });
      }
    }

    return newsletterSuccessResponse('subscribe', requestId);
  } catch (error) {
    logNewsletterFailure({
      action: 'subscribe',
      category: classifyNewsletterFailure(error),
      requestId,
    });
    return newsletterErrorResponse(error, requestId);
  }
};
