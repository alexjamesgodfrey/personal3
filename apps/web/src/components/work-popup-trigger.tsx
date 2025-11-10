import { Button } from '@alexgodfrey/ui/components/ui/button';
import { Kbd } from '@alexgodfrey/ui/components/ui/kbd';
import { navigate } from 'astro:transitions/client';
import { useCallback, useEffect, useState } from 'react';

export function WorkPopupTrigger() {
  const [isScrolled, setIsScrolled] = useState(false);

  const downloadResume = useCallback(() => {
    navigate('/resources/resume.pdf');
  }, [navigate]);

  const scrollToSHV = useCallback(() => {
    const shvElement = document.getElementById('shv-section');
    if (shvElement) {
      shvElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const triggerPoint = 25;
      setIsScrolled(scrollY > triggerPoint);
    };

    // Initial check
    updateScrollState();

    // Listen to scroll events
    window.addEventListener('scroll', updateScrollState, { passive: true });
    document.addEventListener('scroll', updateScrollState, { passive: true });

    // Handle Astro view transitions
    document.addEventListener('astro:page-load', updateScrollState);

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      document.removeEventListener('scroll', updateScrollState);
      document.removeEventListener('astro:page-load', updateScrollState);
    };
  }, []);

  const handleClick = () => {
    if (isScrolled) {
      downloadResume();
    } else {
      scrollToSHV();
    }
  };

  // Handle W keybind for scrolling to SHV when not scrolled
  useEffect(() => {
    if (isScrolled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') {
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
        e.preventDefault();
        scrollToSHV();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScrolled, scrollToSHV]);

  // Handle R keybind for resume download when scrolled
  useEffect(() => {
    if (!isScrolled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
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
        e.preventDefault();
        downloadResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScrolled, downloadResume]);

  return (
    <Button variant="outline" className="uppercase font-mono shadow-none" onClick={handleClick}>
      {isScrolled ? (
        <>
          Resume<Kbd className="ml-1 hidden sm:inline">R</Kbd>
        </>
      ) : (
        <>
          View Work<Kbd className="ml-1 hidden sm:inline">W</Kbd>
        </>
      )}
    </Button>
  );
}
