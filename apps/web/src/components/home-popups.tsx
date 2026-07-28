import * as React from 'react';
import { ContactPopup } from './contact-popup';
import { ProfilePopup } from './profile-popup';

type PopupKind = 'contact' | 'profile';
type PopupRequest = {
  popup: PopupKind;
  mode: 'open' | 'toggle';
};

type HomePopupWindow = Window & {
  __homePopupRequest?: PopupRequest;
};

export function HomePopups({ profileImageSrc }: { profileImageSrc: string }) {
  const [activePopup, setActivePopup] = React.useState<PopupKind | null>(null);

  React.useEffect(() => {
    const applyRequest = (request: PopupRequest) => {
      setActivePopup((current) =>
        request.mode === 'toggle' && current === request.popup ? null : request.popup,
      );
      delete (window as HomePopupWindow).__homePopupRequest;
    };

    const handleRequest = (event: Event) => {
      const request = (event as CustomEvent<PopupRequest>).detail;
      if (request?.popup === 'contact' || request?.popup === 'profile') {
        applyRequest(request);
      }
    };

    window.addEventListener('home:popup-request', handleRequest);

    const queuedRequest = (window as HomePopupWindow).__homePopupRequest;
    if (queuedRequest) {
      applyRequest(queuedRequest);
    }

    return () => window.removeEventListener('home:popup-request', handleRequest);
  }, []);

  return (
    <>
      <ContactPopup
        open={activePopup === 'contact'}
        onOpenChange={(open) => setActivePopup(open ? 'contact' : null)}
      />
      <ProfilePopup
        imageSrc={profileImageSrc}
        open={activePopup === 'profile'}
        onOpenChange={(open) => setActivePopup(open ? 'profile' : null)}
      />
    </>
  );
}
