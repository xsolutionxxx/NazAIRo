"use client";

import { AppButton } from "@/shared/ui/appButton";
import { AppInput } from "@/shared/ui/appInput";
import { EyeOff, Eye } from "lucide-react";
import { useState } from "react";

export default function PasswordInput(
  props: React.ComponentProps<typeof AppInput>,
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <AppInput {...props} type={showPassword ? "text" : "password"}>
        <AppButton
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          intent="empty"
          icon={showPassword ? Eye : EyeOff}
          className="translate-all"
        />
      </AppInput>
    </>
  );
}
