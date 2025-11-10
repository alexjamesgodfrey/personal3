import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Kbd } from '@alexgodfrey/ui/components/ui/kbd';

export function ContactPopupTrigger() {
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).openContactPopup) {
      (window as any).openContactPopup();
    }
  };

  return (
    <Button
      variant="outline"
      className="uppercase font-mono shadow-none !bg-background"
      onClick={handleClick}
    >
      Contact<Kbd className="ml-1 hidden sm:inline">C</Kbd>
    </Button>
  );
}
