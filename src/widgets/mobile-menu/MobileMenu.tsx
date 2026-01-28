"use client";

import Link from "next/link";
import { X, Plane, BedDouble } from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import { Portal } from "@/shared/ui/portal";
import { Button } from "@shared/ui/button";
import { ButtonWithIcon } from "@/shared/ui/buttonWithIcon";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10000"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-10000 px-7 py-14 w-[75vw] xs:w-[65vw] h-screen bg-background shadow-2xl"
            >
              <ButtonWithIcon
                onClick={onClose}
                size={28}
                icon={X}
                className="absolute top-4 right-4 p-0"
              />

              <nav className="mt-8">
                <ul className="flex flex-col gap-6">
                  <li onClick={onClose}>
                    <Link href="/fights">
                      <ButtonWithIcon icon={Plane} iconClasses="w-7 h-7">
                        Find Flight
                      </ButtonWithIcon>
                    </Link>
                  </li>
                  <li>
                    <Link href="/stays">
                      <ButtonWithIcon icon={BedDouble} iconClasses="w-7 h-7">
                        Find Stays
                      </ButtonWithIcon>
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-max flex items-center justify-center bg-primary rounded-lg text-[#112211]">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="px-4 font-semibold text-lg cursor-pointer hover:bg-transparent dark:hover:bg-transparent"
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button className="bg-foreground rounded-lg font-semibold text-lg text-surface cursor-pointer hover:bg-foreground">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
