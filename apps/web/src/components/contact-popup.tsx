import { Button } from '@alexgodfrey/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@alexgodfrey/ui/components/ui/dialog';
import { Kbd } from '@alexgodfrey/ui/components/ui/kbd';
import { siteContent } from '@alexgodfrey/web/lib/site-content';
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
    value: siteContent.contact[0].display,
    href: siteContent.contact[0].href,
    icon: 'squareStackUp',
  },
  {
    label: 'LinkedIn',
    value: siteContent.contact[1].display,
    href: siteContent.contact[1].href,
    icon: 'linkedin',
  },
  {
    label: 'GitHub',
    value: siteContent.contact[2].display,
    href: siteContent.contact[2].href,
    icon: 'github',
  },
];

interface ContactPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactPopup({ open, onOpenChange }: ContactPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="uppercase font-mono text-xs h-7"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
