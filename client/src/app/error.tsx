"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@shared/ui/logo";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo />

      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={36} strokeWidth={1.5} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-foreground-muted max-w-sm">
          An unexpected error occurred. Try refreshing the page or go back to the home page.
        </p>
        {error?.digest && (
          <p className="text-xs text-foreground-muted font-mono bg-surface px-3 py-1 rounded-lg border border-[#D7E2EE]">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary/80 transition-colors"
        >
          <RefreshCw size={16} strokeWidth={2} />
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-[#D7E2EE] font-semibold rounded-xl hover:border-primary transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
