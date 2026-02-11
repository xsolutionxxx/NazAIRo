import Link from "next/link";
import { EyeOff } from "lucide-react";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import AuthActions from "./AuthActions";

export default function LoginForm() {
 return (
    <form action="" className="mb-10 w-full flex flex-col gap-6">
      <AppInput id="login-email" name="email" placeholder="Enter your email address" label="Email" errorMsg="" />
      <AppInput id="login-password" name="password" placeholder="Enter your password" label="Password" errorMsg="" iconEnd={EyeOff} />

      <div className="flex justify-between">
        <AppCheckbox label="Remember me" />
        <Link href="/" className="font-medium text-sm text-accent hover:underline transition-all capitalize">forgot password</Link>
      </div>

      <AuthActions type="login" />
    </form>
 );
}