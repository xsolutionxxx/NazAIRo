"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { Menu, Plane, BedDouble } from "lucide-react";

import { Container } from "@shared/ui/container";
import { AppButton } from "@/shared/ui/appButton";
import { Logo } from "@shared/ui/logo";

import MobileMenu from "../mobile-menu/MobileMenu";

import { cn } from "@shared/lib/utils";

import { ThemeToggleVortex } from "@/features/theme-toggle/ui/ThemeToggleVortex";

interface HeaderProps {
  className?: string;
  variant?: "hero" | "default";
}

export default function Header({
  className,
  variant = "default",
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHero = variant === "hero";

  const logotype = isHero ? (
    <Link
      href="/"
      className="absolute right-1/2 translate-x-1/2 inline-block transition-opacity hover:opacity-90"
    >
      <Image
        src="/logo_light.svg"
        alt="Logotype NazAIRo"
        width={110}
        height={40}
        className="w-full h-10 md:h-9 lg:h-10"
      />
    </Link>
  ) : (
    <Logo className="absolute right-1/2 translate-x-1/2" />
  );
  const background = isHero ? "bg-transparent" : "bg-surface shadow-lg";
  const bgBtnColor = isHero
    ? "bg-white"
    : "bg-foreground text-surface hover:text-[#112211]";
  const textColor = isHero ? "text-white" : "text-foreground";

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize(mediaQuery);

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          `relative py-5 lg:py-6 xl:py-7 ${background} ${className}`,
        )}
      >
        <Container className="flex justify-between items-center">
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/fights">
              <AppButton intent="ghost" icon={Plane} className={textColor}>
                Find Flight
              </AppButton>
            </Link>
            <Link href="/stays">
              <AppButton intent="ghost" icon={BedDouble} className={textColor}>
                Find Stays
              </AppButton>
            </Link>
          </div>

          {logotype}

          <div className="hidden md:flex items-center gap-8">
            <ThemeToggleVortex className={textColor} />
            <Link href="/login">
              <AppButton intent="ghost" className={textColor}>
                Login
              </AppButton>
            </Link>
            <Link href="/sign-up">
              <AppButton className={cn(`font-semibold ${bgBtnColor}`)}>
                Sign Up
              </AppButton>
            </Link>
          </div>

          <ThemeToggleVortex className={cn(`md:hidden ${textColor}`)} />

          <AppButton
            intent="ghost"
            icon={Menu}
            iconClasses="w-7 h-7"
            className={cn(`md:hidden ${textColor}`)}
            onClick={() => setIsMobileMenuOpen(true)}
          />

          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </Container>
      </header>
    </>
  );
}
