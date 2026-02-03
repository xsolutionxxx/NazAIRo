"use client";

import Link from "next/link";
import { X, Plane, BedDouble } from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import { Portal } from "@/shared/ui/portal";
import { Button } from "@shared/ui/button";
import { AppButton } from "@/shared/ui/appButton";

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
              className="fixed top-0 right-0 z-10000 px-7 py-14 w-[70vw] xs:w-[60vw] h-screen bg-background shadow-2xl"
            >
              <AppButton
                onClick={onClose}
                intent="ghost"
                icon={X}
                iconSize={28}
                className="absolute top-5 right-4 p-0 h-auto"
              />

              <nav className="mt-8">
                <ul className="flex flex-col gap-6">
                  <li onClick={onClose}>
                    <Link href="/fights">
                      <AppButton icon={Plane} intent="ghost">
                        Find Flight
                      </AppButton>
                    </Link>
                  </li>
                  <li>
                    <Link href="/stays">
                      <AppButton icon={BedDouble} intent="ghost">
                        Find Stays
                      </AppButton>
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-max flex items-center justify-center bg-primary rounded">
                <Link href="/login">
                  <AppButton className="xs:px-7 font-semibold text-[#112211]">
                    Login
                  </AppButton>
                </Link>

                <Link href="/signup">
                  <AppButton className="xs:px-5 bg-foreground font-semibold text-surface">
                    Sign Up
                  </AppButton>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
