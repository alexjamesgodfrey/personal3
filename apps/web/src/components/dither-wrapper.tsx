import React from "react";

interface DitherWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function DitherWrapper({
  children,
  className = "",
}: DitherWrapperProps) {
  return <div className={`dither ${className}`}>{children}</div>;
}
