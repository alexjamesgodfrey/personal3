import { Alert, AlertDescription, AlertTitle } from '@alexgodfrey/ui/components/ui/alert';
import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Input } from '@alexgodfrey/ui/components/ui/input';
import { Label } from '@alexgodfrey/ui/components/ui/label';
import { cn } from '@alexgodfrey/ui/lib/utils';
import { PUBLIC_NEWSLETTER_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { Loader2, Sparkles } from 'lucide-react';
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
    <div
      className={cn(
        'rounded-xl border border-muted-foreground/20 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/60 p-6 shadow-sm backdrop-blur-sm dark:from-amber-100/10 dark:via-background dark:to-emerald-100/10',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Field Notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Join the newsletter</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Occasional dispatches on engineering for longevity, experiments, and readings.
          </p>
        </div>
        <Sparkles className="hidden h-6 w-6 text-amber-500 sm:block" aria-hidden />
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-2 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.15em]">
                Email
              </Label>
              <span aria-hidden className="text-[10px] text-muted-foreground/70">
                Required
              </span>
            </div>
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
            <Label htmlFor="name" className="font-mono text-[11px] uppercase tracking-[0.15em]">
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
            size="lg"
            aria-live="polite"
            disabled={state.status === 'loading' || Boolean(turnstileSiteKey && !turnstileToken)}
            className="gap-2 rounded-lg px-6 font-semibold uppercase tracking-wide"
          >
            {state.status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Adding you...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Get updates
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">Zero spam. Unsubscribe anytime.</p>
        </div>
      </form>

      {state.message && (
        <Alert
          variant={state.status === 'error' ? 'destructive' : 'default'}
          className="mt-6"
          role="status"
        >
          <AlertTitle className="font-semibold">
            {state.status === 'error' ? 'Something went wrong' : 'You are in'}
          </AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
