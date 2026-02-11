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
          intent="empty"
          icon={showPassword ? Eye : EyeOff}
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="translate-all"
        />
      </AppInput>
    </>
  );
}
