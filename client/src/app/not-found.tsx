import Link from "next/link";
import { Logo } from "@shared/ui/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo />

      <div className="flex flex-col items-center gap-3">
        <span className="text-8xl font-bold font-heading text-primary">404</span>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-foreground-muted max-w-sm">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="px-8 py-3 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary/80 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
