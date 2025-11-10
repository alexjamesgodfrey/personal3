import { Dialog, DialogContent } from '@alexgodfrey/ui/components/ui/dialog';
import * as React from 'react';

export function ProfilePopup() {
  const [open, setOpen] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Expose open function globally for image click
  React.useEffect(() => {
    (window as any).openProfilePopup = () => setOpen(true);
    return () => {
      delete (window as any).openProfilePopup;
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden pb-4 p-0 gap-0 border-0 shadow-none bg-background"
        showCloseButton={false}
      >
        <img
          src="/images/profile.webp"
          alt="Alex Godfrey"
          className="w-full h-full max-h-[90vh] object-contain relative"
        />
        <p className="font-mono font-bold text-xl">Fig ^</p>
      </DialogContent>
    </Dialog>
  );
}
