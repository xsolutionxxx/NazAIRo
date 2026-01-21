"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

export const Portal = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(raf);
      setMounted(false);
    };
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};
