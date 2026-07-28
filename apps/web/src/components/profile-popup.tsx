import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@alexgodfrey/ui/components/ui/dialog';

interface ProfilePopupProps {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfilePopup({ imageSrc, open, onOpenChange }: ProfilePopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden pb-4 p-0 gap-0 border-0 shadow-none bg-background"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Alex Godfrey profile photo</DialogTitle>
        <DialogDescription className="sr-only">
          A full-size portrait of Alex Godfrey.
        </DialogDescription>
        <img
          src={imageSrc}
          alt="Alex Godfrey"
          className="w-full h-full max-h-[90vh] object-contain relative"
        />
        <p className="font-mono font-bold text-xl">Fig ^</p>
      </DialogContent>
    </Dialog>
  );
}
