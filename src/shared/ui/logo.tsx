"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Link
      href="/"
      className={cn(
        "inline-block transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Image
        src="/logo_dark.svg"
        alt="Logotype NazAIRo"
        width={110}
        height={40}
        priority
        className="block dark:hidden w-auto h-10 md:h-9 lg:h-10"
      />
      <Image
        src="/logo_light.svg"
        alt="Logotype NazAIRo"
        width={110}
        height={40}
        priority
        className="hidden dark:block w-auto h-10 md:h-9 lg:h-10"
      />
    </Link>
  );
};
