import type { APIRoute } from 'astro';
import { sendWelcomeEmail } from '../../../lib/email';
import { subscribeToNewsletter } from '../../../lib/newsletter-db';

export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let email = '';
  let name: string | undefined;

  try {
    const body = (await request.json()) as { email?: string; name?: string };
    email = (body.email || '').trim().toLowerCase();
    name = body.name?.trim();
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
    const { subscriber, isNew } = await subscribeToNewsletter(email, name, 'newsletter-page');

    let welcomeStatus: 'sent' | 'skipped' | 'error' | undefined = 'skipped';
    if (isNew) {
      const welcome = await sendWelcomeEmail({ to: subscriber.email, name });
      welcomeStatus = welcome.status;
      if (welcome.status === 'error') {
        console.error('welcome-email-send-failed', welcome.error);
      }
    }

    return Response.json({
      status: 'ok',
      message: 'Thank you.',
      welcomeStatus,
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
        subscribed_at: subscriber.subscribed_at,
      },
    });
  } catch (error: unknown) {
    console.error('newsletter-subscribe-error', error);
    return Response.json(
      { status: 'error', error: 'Unable to save your email right now. Please try again shortly.' },
      { status: 500 },
    );
  }
};
