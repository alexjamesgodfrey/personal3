import { Alert, AlertDescription, AlertTitle } from '@alexgodfrey/ui/components/ui/alert';
import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Input } from '@alexgodfrey/ui/components/ui/input';
import { Label } from '@alexgodfrey/ui/components/ui/label';
import { cn } from '@alexgodfrey/ui/lib/utils';
import { PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

type TurnstileApi = {
  remove: (widgetId: string | number) => void;
  render: (
    container: HTMLElement,
    options: {
      action: string;
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
      sitekey: string;
      theme: 'auto';
    },
  ) => string | number;
  reset: (widgetId: string | number) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type FormState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
};

let turnstileScriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile did not initialize.'));
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-newsletter-turnstile]');

    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.newsletterTurnstile = '';
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), {
      once: true,
    });
    document.head.append(script);
  });

  return turnstileScriptPromise;
}

export function NewsletterForm({ className }: { className?: string }) {
  const [state, setState] = React.useState<FormState>({ status: 'idle' });
  const [turnstileToken, setTurnstileToken] = React.useState('');
  const turnstileContainer = React.useRef<HTMLDivElement>(null);
  const turnstileWidget = React.useRef<string | number | undefined>(undefined);
  const turnstileSiteKey = PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY;

  React.useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainer.current) return;

    let cancelled = false;
    void loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !turnstileContainer.current) return;
        turnstileWidget.current = turnstile.render(turnstileContainer.current, {
          sitekey: turnstileSiteKey,
          action: 'newsletter_subscribe',
          theme: 'auto',
          callback: setTurnstileToken,
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: 'The anti-spam check could not load. Please refresh and try again.',
          });
        }
      });

    return () => {
      cancelled = true;
      if (window.turnstile && turnstileWidget.current !== undefined) {
        window.turnstile.remove(turnstileWidget.current);
        turnstileWidget.current = undefined;
      }
    };
  }, [turnstileSiteKey]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const website = String(formData.get('website') || '');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState({ status: 'error', message: 'Add a valid email to join.' });
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setState({ status: 'error', message: 'Complete the anti-spam check before joining.' });
      return;
    }

    setState({ status: 'loading' });

    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: name || undefined,
        website,
        turnstileToken: turnstileToken || undefined,
      }),
    }).catch(() => null);

    const data = await response?.json().catch(() => null);

    if (!response || data?.status !== 'ok') {
      if (window.turnstile && turnstileWidget.current !== undefined) {
        window.turnstile.reset(turnstileWidget.current);
        setTurnstileToken('');
      }
      setState({
        status: 'error',
        message: data?.error || 'Something went wrong. Try again in a moment.',
      });
      return;
    }

    form.reset();
    if (window.turnstile && turnstileWidget.current !== undefined) {
      window.turnstile.reset(turnstileWidget.current);
      setTurnstileToken('');
    }
    setState({ status: 'success', message: data.message });
  };

  return (
    <div className={cn(className)}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-2 sm:col-span-2">
            <Label htmlFor="email" className="font-mono text-xs uppercase text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              aria-required="true"
              disabled={state.status === 'loading'}
            />
          </label>

          <label className="space-y-2">
            <Label htmlFor="name" className="font-mono text-xs uppercase text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="(optional)"
              disabled={state.status === 'loading'}
            />
          </label>
        </div>

        {turnstileSiteKey && <div ref={turnstileContainer} aria-label="Anti-spam verification" />}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="outline"
            aria-live="polite"
            disabled={state.status === 'loading' || Boolean(turnstileSiteKey && !turnstileToken)}
            className="gap-2 uppercase font-mono !shadow-none !bg-background"
          >
            {state.status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
          <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </form>

      {state.message && (
        <Alert
          variant={state.status === 'error' ? 'destructive' : 'default'}
          className="mt-6"
          role="status"
        >
          <AlertTitle className="font-semibold">
            {state.status === 'error' ? 'Something went wrong' : 'Subscribed'}
          </AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
