import { AppButton } from "@/shared/ui/appButton";
import Link from "next/link";

interface AuthActionsProps {
  type: "login" | "sign up";
}

export default function AuthActions({ type }: AuthActionsProps) {
  const isLogin = type === "login";

  return (
    <div className="flex flex-col items-center gap-4">
      <AppButton type="submit" className="w-full">
        {isLogin ? "Login" : "Sign Up"}
      </AppButton>

      <p className="font-medium text-sm text-center">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? "/sign-up" : "/login"}
          className="text-accent hover:underline transition-all"
        >
          {isLogin ? "Sign Up" : "Login"}
        </Link>
      </p>
    </div>
  );
}
