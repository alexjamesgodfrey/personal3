import { Alert, AlertDescription, AlertTitle } from '@alexgodfrey/ui/components/ui/alert';
import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Input } from '@alexgodfrey/ui/components/ui/input';
import { Label } from '@alexgodfrey/ui/components/ui/label';
import { cn } from '@alexgodfrey/ui/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';
import * as React from 'react';

type FormState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
};

export function NewsletterForm({ className }: { className?: string }) {
  const [state, setState] = React.useState<FormState>({ status: 'idle' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const name = String(formData.get('name') || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState({ status: 'error', message: 'Add a valid email to join.' });
      return;
    }

    setState({ status: 'loading' });

    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: name || undefined }),
    }).catch(() => null);

    const data = await response?.json().catch(() => null);

    if (!response || data?.status !== 'ok') {
      setState({
        status: 'error',
        message: data?.error || 'Something went wrong. Try again in a moment.',
      });
      return;
    }

    form.reset();
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="lg"
            aria-live="polite"
            disabled={state.status === 'loading'}
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
