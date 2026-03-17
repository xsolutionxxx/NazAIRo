"use client";

import { motion, useTransform, MotionValue } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ParallaxItemProps {
  children: ReactNode;
  speedX?: number;
  speedY?: number;
  speedZ?: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  rotateSpeed?: number;
  baseScale?: number;
  className?: string;
  initialLeft?: number;
}

export const ParallaxItem = ({
  children,
  speedX = 0,
  speedY = 0,
  speedZ = 0,
  mouseX,
  mouseY,
  rotateSpeed = 0,
  baseScale = 1,
  initialLeft = 50,
  className,
}: ParallaxItemProps) => {
  const x = useTransform(mouseX, (val) => val * speedX * -1);
  const y = useTransform(mouseY, (val) => val * speedY);

  const z = useTransform(mouseX, (latestX) => {
    const isInLeft = initialLeft < 50 ? 1 : -1;
    return latestX * isInLeft * speedZ * 0.1;
  });

  const rotateY = useTransform(mouseX, (val) => {
    const halfWidth = typeof window !== "undefined" ? window.innerWidth / 2 : 1;
    return (val / halfWidth) * rotateSpeed;
  });

  return (
    <motion.div
      style={{ x, y, z, rotateY, scale: baseScale }}
      className={cn(
        "absolute w-full md:h-auto -translate-1/2 pointer-events-none will-change-transform",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};
