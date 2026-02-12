"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const MotionSun = motion.create(Sun);
const MotionMoon = motion.create(Moon);

const vortexVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -360,
    filter: "blur(10px)",
    opacity: 0,
  },

  animate: {
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },

  exit: {
    scale: 0,
    rotate: 360,
    filter: "blur(10px)",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

export const ThemeToggleVortex = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) {
    return <div className={cn("w-7 h-7 lg:w-9 lg:h-9", className)} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative w-7 h-7 md:w-8.5 md:h-8.5 lg:w-9 lg:h-9 flex items-center justify-center rounded-full cursor-pointer transition-colors md:hover:bg-black/10 lg:dark:hover:bg-white/10",
        className,
      )}
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <MotionSun
            key="sun"
            className="text-neutral absolute w-7 h-7 md:w-6 md:h-6"
            variants={vortexVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        ) : (
          <MotionMoon
            key="moon"
            className="text-neutral absolute w-7 h-7 md:w-6 md:h-6"
            variants={vortexVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
      </AnimatePresence>
    </button>
  );
};
