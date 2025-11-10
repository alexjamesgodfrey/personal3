'use client';

import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Kbd } from '@alexgodfrey/ui/components/ui/kbd';

export function WorkPopupTrigger() {
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).openWorkPopup) {
      (window as any).openWorkPopup();
    }
  };

  return (
    <Button variant="outline" className="uppercase font-mono shadow-none" onClick={handleClick}>
      View Work<Kbd className="ml-1 hidden sm:inline">W</Kbd>
    </Button>
  );
}
