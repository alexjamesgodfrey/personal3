'use client';

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
import Icon from './icon-sprite';

interface ContactMethod {
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
  icon?: 'squareStackUp' | 'arrowUpRight';
}

const contactMethods: ContactMethod[] = [
  {
    label: 'Email',
    value: 'alex@example.com', // Replace with actual email
    href: 'mailto:alex@example.com',
    copyable: true,
    icon: 'squareStackUp',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/alexgodfrey', // Replace with actual LinkedIn
    href: 'https://linkedin.com/in/alexgodfrey',
    copyable: true,
    icon: 'squareStackUp',
  },
  {
    label: 'GitHub',
    value: 'github.com/alexgodfrey', // Replace with actual GitHub
    href: 'https://github.com/alexgodfrey',
    copyable: true,
    icon: 'squareStackUp',
  },
];

export function ContactPopup() {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);

  // Handle keyboard shortcut (C key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
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

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">Contact</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground/60">
            Get in touch
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors border border-transparent hover:border-muted-foreground/20"
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-wide">
                    {method.label}
                  </span>
                  {method.copyable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(method.value, method.label);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-muted-foreground/50 hover:text-foreground"
                    >
                      {copied === method.label ? '✓' : '↗'}
                    </button>
                  )}
                </div>
                {method.href ? (
                  <a
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block text-sm text-foreground hover:text-muted-foreground/80 transition-colors truncate mt-0.5"
                    onClick={(e) => {
                      if (method.copyable) {
                        e.preventDefault();
                        handleCopy(method.value, method.label);
                      }
                    }}
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="text-sm text-foreground truncate mt-0.5">{method.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-muted-foreground/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50 font-mono">
            <Kbd className="text-[10px]">C</Kbd> toggle · <Kbd className="text-[10px]">ESC</Kbd>{' '}
            close
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
