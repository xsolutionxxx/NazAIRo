import Link from "next/link";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import AuthActions from "./AuthActions";

export default function SignUpForm() {
  return (
    <form action="" className="mb-10 w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6">
        <AppInput
          id="sign-up-first-name"
          name="first-name"
          placeholder="Your first name"
          label="first name"
        />
        <AppInput
          id="sign-up-last-name"
          name="last-name"
          placeholder="Your last name"
          label="last name"
        />
        <AppInput
          id="sign-up-email"
          name="email"
          placeholder="Your email"
          label="Email"
        />
        <AppInput
          id="sign-up-phone"
          name="phone"
          placeholder="Your number"
          label="phone number"
        />
      </div>

      <AppInput
        id="sign-up-password"
        name="password"
        placeholder="Come up with a password"
        label="Password"
      />
      <AppInput
        id="sign-up-confirm-password"
        name="confirm-password"
        placeholder="Repeat the password"
        label="confirm password"
      />

      <AppCheckbox
        id="terms"
        name="terms"
        label={
          <span className="text-sm">
            I agree to all the{" "}
            <Link
              href="/terms"
              className="text-accent hover:underline transition-all"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policies"
              className="text-accent hover:underline transition-all"
            >
              Privacy Policies
            </Link>
          </span>
        }
      />

      <AuthActions type="sign up" />
    </form>
  );
}
