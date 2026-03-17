import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { AppButton } from "@shared/ui/appButton";
import { AppTitle } from "@shared/ui/appTitle";

interface PropsAppModal {
  isOpen: boolean;
  onClose: () => void;
  titleText?: string;
  subtitleText?: string;
  children: React.ReactNode;
}

export const AppModal = ({
  isOpen,
  onClose,
  titleText,
  subtitleText,
  children,
}: PropsAppModal) => {
  return (
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
            initial={{
              clipPath: "circle(0% at 50% 100%)",
              opacity: 0,
            }}
            animate={{
              clipPath: "circle(150% at 50% 50%)",
              opacity: 1,
            }}
            exit={{
              clipPath: "circle(0% at 50% 50%)",
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.19, 1, 0.22, 1],
            }}
            className="fixed top-1/2 left-1/2 -translate-1/2 p-10 md:p-16 h-max w-full max-w-130 bg-surface rounded-xl shadow-2xl z-10001"
          >
            <AppButton
              intent="ghost"
              icon={X}
              onClick={onClose}
              className="absolute top-5 right-6"
            />
            <div className="mb-12">
              <AppTitle text={titleText} className="mb-4" />
              <p>{subtitleText}</p>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
