import { RESEND_API_KEY } from 'astro:env/server';
import { Resend } from 'resend';

type WelcomeArgs = {
  to: string;
  name?: string;
};

const globalForEmail = globalThis as typeof globalThis & {
  resendClient?: Resend;
};

function getResend() {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  if (!globalForEmail.resendClient) {
    globalForEmail.resendClient = new Resend(RESEND_API_KEY);
  }

  return globalForEmail.resendClient;
}

export async function sendWelcomeEmail({ to, name }: WelcomeArgs) {
  if (!RESEND_API_KEY) {
    return { status: 'skipped', reason: 'RESEND_API_KEY not set' } as const;
  }

  const firstName = name?.split(' ')[0]?.trim();
  const greeting = firstName ? `Hey ${firstName},` : 'Hey there,';

  const html = `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; line-height: 1.6; padding: 16px;">
      <p style="font-size: 15px; margin-bottom: 16px;">${greeting}</p>
      <p style="margin: 0 0 12px 0;">Thanks for joining the newsletter. I'll only send when there's something worth your time: what I'm building, reading, and testing.</p>
      <p style="margin: 0 0 12px 0;">If you want to steer topics or say hi, just reply here. I read everything.</p>
      <p style="margin: 0 0 18px 0;">— Alex</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <p style="font-size: 12px; color: #64748b; margin: 0;">Unsubscribe anytime: just reply "unsubscribe" or visit alexgodfrey.com/newsletter.</p>
    </div>
  `;

  const text = `${greeting}

Thanks for joining the newsletter. I'll only send when there's something worth your time: what I'm building, reading, and testing.

If you want to steer topics or say hi, just reply here. I read everything.

— Alex

Unsubscribe anytime: reply "unsubscribe" or visit alexgodfrey.com/newsletter.
`;

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: 'Alex from Godfrey <kiwi@automations.godfrey.email>',
      to,
      subject: 'Welcome to the newsletter',
      html,
      text,
      replyTo: 'me@alexgodfrey.com',
      tags: [
        { name: 'list', value: 'newsletter' },
        { name: 'source', value: 'newsletter-page' },
      ],
    });

    return { status: 'sent', id: result.data?.id } as const;
  } catch {
    console.error('welcome-email-send-failed');
    return { status: 'error' } as const;
  }
}
