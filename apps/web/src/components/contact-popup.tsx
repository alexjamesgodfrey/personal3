import { Button } from '@alexgodfrey/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@alexgodfrey/ui/components/ui/dialog';
import { Kbd } from '@alexgodfrey/ui/components/ui/kbd';
import * as React from 'react';
import Icon, { type IconName } from './icon-sprite';

interface ContactMethod {
  label: string;
  value: string;
  href: string;
  icon?: IconName;
}

const contactMethods: ContactMethod[] = [
  {
    label: 'Email',
    value: 'me@alexgodfrey.com',
    href: 'mailto:me@alexgodfrey.com',
    icon: 'squareStackUp',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/alexgodfrey',
    href: 'https://linkedin.com/in/alexgodfreyapi',
    icon: 'linkedin',
  },
  {
    label: 'GitHub',
    value: 'github.com/alexjamesgodfrey',
    href: 'https://github.com/alexjamesgodfrey',
    icon: 'github',
  },
];

export function ContactPopup() {
  const [open, setOpen] = React.useState(false);

  // Handle keyboard shortcut (C key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        // Don't trigger if modifier keys are pressed
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
          return;
        }
        // Don't trigger if user is typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)
        ) {
          return;
        }
        setOpen((prev) => !prev);
      }
      // Close on Escape
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Expose open function globally for button click
  React.useEffect(() => {
    (window as any).openContactPopup = () => setOpen(true);
    return () => {
      delete (window as any).openContactPopup;
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4/5 sm:max-w-md max-h-[80vh] overflow-y-auto z-[999999]">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">Contact</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground/60">
            Get in touch
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/20 block"
            >
              {method.icon && (
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted/50 group-hover:bg-muted transition-colors">
                  <Icon
                    name={method.icon}
                    className="text-muted-foreground/70 group-hover:text-foreground transition-colors"
                    size={16}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-wide block">
                  {method.label}
                </span>
                <p className="text-sm text-foreground truncate mt-0.5">{method.value}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-muted-foreground/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50 font-mono">
            <Kbd className="text-[10px] hidden sm:block">ESC</Kbd>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="uppercase font-mono text-xs h-7"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
