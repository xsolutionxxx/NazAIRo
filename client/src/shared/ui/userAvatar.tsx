"use client";

import { useState, useEffect } from "react";
import { cn } from "@shared/lib/utils";

interface AppAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export function UserAvatar({ src, alt, className }: AppAvatarProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const showPlaceholder = !src || error;

  return (
    <span
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {showPlaceholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/profile-placeholder.png"
          alt={alt ?? "user"}
          className="w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt ?? "user"}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
          onLoad={() => setError(false)}
        />
      )}
    </span>
  );
}
