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
        style={{ width: "auto" }}
        className="block dark:hidden h-10 md:h-9 lg:h-10"
      />
      <Image
        src="/logo_light.svg"
        alt="Logotype NazAIRo"
        width={110}
        height={40}
        priority
        style={{ width: "auto" }}
        className="hidden dark:block h-10 md:h-9 lg:h-10"
      />
    </Link>
  );
};
