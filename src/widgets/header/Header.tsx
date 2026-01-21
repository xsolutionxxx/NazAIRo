"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { Menu, Plane, BedDouble } from "lucide-react";

import { Button } from "@shared/ui/button";
import { ButtonWithIcon } from "@/shared/ui/buttonWithIcon";

import MobileMenu from "../mobile-menu/MobileMenu";

import { ThemeToggleVortex } from "@/features/theme-toggle/ui/ThemeToggleVortex";

export default function Header({ className }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={`relative py-5 lg:py-6 xl:py-7 flex justify-between items-center ${className}`}
      >
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/fights">
            <ButtonWithIcon icon={Plane} className="text-neutral">
              Find Flight
            </ButtonWithIcon>
          </Link>
          <Link href="/stays">
            <ButtonWithIcon icon={BedDouble} className="text-neutral">
              Find Stays
            </ButtonWithIcon>
          </Link>
        </div>
        <Link
          href="/"
          className="absolute right-1/2 translate-x-1/2 lg:cursor-pointer"
        >
          <Image
            src="/logo.svg"
            alt="Logotype NazAIRo"
            width={110}
            height={40}
            className="md:h-8 lg:h-10"
          />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <ThemeToggleVortex className="text-neutral lg:cursor-pointer" />
          <Link href="/login">
            <Button
              variant="ghost"
              className="p-0 font-semibold text-[10px] md:text-xs lg:text-sm text-neutral lg:cursor-pointer lg:hover:text-salmon"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="md:px-4 md:py-3 lg:px-6 lg:py-5 bg-neutral rounded-lg font-semibold text-[10px] md:text-xs lg:text-sm lg:cursor-pointer lg:hover:text-neutral lg:hover:bg-salmon">
              Sign Up
            </Button>
          </Link>
        </div>

        <ThemeToggleVortex className="md:hidden" />

        <ButtonWithIcon
          onClick={() => setIsMobileMenuOpen(true)}
          icon={Menu}
          size={28}
          className="md:hidden text-neutral"
        />
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>
    </>
  );
}
