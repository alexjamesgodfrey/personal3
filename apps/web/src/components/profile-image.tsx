'use client';

import * as React from 'react';

interface ProfileImageProps {
  className?: string;
  size?: string;
}

export function ProfileImage({ className = '', size = 'size-6 sm:size-8' }: ProfileImageProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).openProfilePopup) {
      (window as any).openProfilePopup();
    }
  };

  return (
    <img
      src="/images/profile.webp"
      alt="Alex Godfrey"
      className={`${size} rounded-full cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={handleClick}
    />
  );
}

