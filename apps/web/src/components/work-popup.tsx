'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@alexgodfrey/ui/components/ui/dialog';
import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Kbd } from '@alexgodfrey/ui/components/ui/kbd';

interface WorkItem {
  title: string;
  description: string;
  tags?: string[];
}

const workItems: WorkItem[] = [
  {
    title: 'OneTwentyOne',
    description: 'Longevity Company in partnership with Michael Lustgarten',
  },
  {
    title: 'thiscellpaintingdoesnotexist.com',
    description: 'AI-generated cell painting visualization project',
  },
  {
    title: 'Conquer Biomark',
    description: 'Biomarker tracking and visualization platform',
  },
  {
    title: 'CellPaint',
    description: 'Advanced cell painting analysis and visualization',
  },
];

export function WorkPopup() {
  const [open, setOpen] = React.useState(false);

  // Handle keyboard shortcut (W key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') {
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
    (window as any).openWorkPopup = () => setOpen(true);
    return () => {
      delete (window as any).openWorkPopup;
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">Work</DialogTitle>
          <DialogDescription className="font-mono text-sm">
            Selected projects and collaborations
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {workItems.map((item, index) => (
            <div
              key={index}
              className="border border-muted-foreground/30 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors"
            >
              <h3 className="font-mono font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground/80 text-sm">{item.description}</p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs font-mono px-2 py-1 bg-muted rounded border border-muted-foreground/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-muted-foreground/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60 font-mono">
            Press <Kbd>W</Kbd> to toggle or <Kbd>ESC</Kbd> to close
          </p>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="uppercase font-mono shadow-none"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

