"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { Menu, Plane, BedDouble } from "lucide-react";

import { AppButton } from "@/shared/ui/appButton";

import MobileMenu from "../mobile-menu/MobileMenu";

import { ThemeToggleVortex } from "@/features/theme-toggle/ui/ThemeToggleVortex";

export default function Header({ className }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        className={`relative py-5 lg:py-6 xl:py-7 flex justify-between items-center ${className}`}
      >
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/fights">
            <AppButton
              intent="ghost"
              icon={Plane}
              className="text-white md:hover:text-accent"
            >
              Find Flight
            </AppButton>
          </Link>
          <Link href="/stays">
            <AppButton
              intent="ghost"
              icon={BedDouble}
              className="text-white md:hover:text-accent"
            >
              Find Stays
            </AppButton>
          </Link>
        </div>

        <Link href="/" className="absolute right-1/2 translate-x-1/2">
          <Image
            src="/logo.svg"
            alt="Logotype NazAIRo"
            width={110}
            height={40}
            className="w-full h-10 md:h-9 lg:h-10"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <ThemeToggleVortex className="text-white" />
          <Link href="/login">
            <AppButton
              intent="ghost"
              className="text-white md:hover:text-accent hover:bg-transparent"
            >
              Login
            </AppButton>
          </Link>
          <Link href="/signup">
            <AppButton className="bg-white text-[#112211] font-semibold  hover:bg-white">
              Sign Up
            </AppButton>
          </Link>
        </div>

        <ThemeToggleVortex className="md:hidden text-white" />

        <AppButton
          intent="ghost"
          icon={Menu}
          iconClasses="w-7 h-7"
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(true)}
        />

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>
    </>
  );
}
