import Link from "next/link";
import { Logo } from "@shared/ui/logo";
import { ShieldOff } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo />

      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldOff size={36} strokeWidth={1.5} className="text-destructive" />
        </div>
        <span className="text-8xl font-bold font-heading text-destructive/60">403</span>
        <h1 className="text-2xl font-bold">Access forbidden</h1>
        <p className="text-foreground-muted max-w-sm">
          You don&apos;t have permission to access this page.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="px-8 py-3 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary/80 transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/login"
          className="px-8 py-3 border border-[#D7E2EE] font-semibold rounded-xl hover:border-primary transition-colors"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
