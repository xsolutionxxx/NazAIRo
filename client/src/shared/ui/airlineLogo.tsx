"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@shared/lib/utils";

interface AirlineLogoProps {
  iata: string;
  name: string;
  className?: string;
}

export function AirlineLogo({ iata, name, className }: AirlineLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={cn("h-8 w-16 bg-primary-muted rounded flex items-center justify-center text-xs font-bold text-primary", className)}>
        {iata}
      </div>
    );
  }

  return (
    <div className={cn("relative h-8 w-16", className)}>
      <Image
        src={`https://www.gstatic.com/flights/airline_logos/70px/${iata}.png`}
        alt={name}
        fill
        className="object-contain"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
