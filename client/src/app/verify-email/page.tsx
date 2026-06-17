"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Container } from "@shared/ui/container";
import { AppButton } from "@shared/ui/appButton";
import { Logo } from "@shared/ui/logo";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <Container className="min-h-screen flex flex-col items-center justify-center py-12">
      {/* Logo */}
      <div className="mb-12">
        <Logo />
      </div>

      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail size={40} className="text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
          <p className="text-foreground-muted">
            We've sent an activation link to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-left bg-surface p-4 rounded-xl border border-[#D7E2EE]">
          <p className="text-sm text-foreground-muted">
            <span className="font-semibold text-foreground">To get started:</span>
          </p>
          <ol className="space-y-2 text-sm text-foreground-muted list-decimal list-inside">
            <li>Open your email inbox</li>
            <li>Look for the message from Golobe</li>
            <li>Click the activation link in the email</li>
            <li>Your account will be created and you'll be automatically logged in</li>
          </ol>
        </div>

        {/* Check email hint */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <span className="font-medium">Tip:</span> Check your spam folder if you don't see the email in a few moments.
          </p>
        </div>

        {/* Back to login */}
        <Link href="/login" className="inline-block w-full">
          <AppButton icon={ArrowRight} className="w-full">
            Back to login
          </AppButton>
        </Link>

        <p className="text-xs text-foreground-muted">
          Didn't get the email? Check your spam folder or{" "}
          <Link href="/sign-up" className="text-primary hover:underline font-medium">
            try signing up again
          </Link>
        </p>
      </div>
    </Container>
  );
}
