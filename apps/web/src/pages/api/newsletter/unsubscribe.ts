import type { APIRoute } from 'astro';
import { unsubscribeFromNewsletter } from '../../../lib/newsletter-db';

export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let email = '';

  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email || '').trim().toLowerCase();
  } catch (error) {
    return Response.json({ status: 'error', error: 'Invalid request payload.' }, { status: 400 });
  }

  if (!email || !emailPattern.test(email)) {
    return Response.json(
      { status: 'error', error: 'Please provide a valid email address.' },
      { status: 400 },
    );
  }

  try {
    const subscriber = await unsubscribeFromNewsletter(email, 'self-service');
    return Response.json({
      status: 'ok',
      message: 'You have been unsubscribed.',
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
        unsubscribed_at: subscriber.unsubscribed_at,
      },
    });
  } catch (error: unknown) {
    console.error('newsletter-unsubscribe-error', error);
    return Response.json(
      { status: 'error', error: 'Unable to process your request right now. Please try again.' },
      { status: 500 },
    );
  }
};
