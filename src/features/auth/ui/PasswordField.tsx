"use client";

import { AppButton } from "@/shared/ui/appButton";
import { AppInput } from "@/shared/ui/appInput";
import { EyeOff, Eye } from "lucide-react";
import { useState } from "react";

interface PasswordFieldProps extends React.ComponentProps<typeof AppInput> {
  isLoading?: boolean;
}

export default function PasswordField({
  isLoading,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isLoading ? "password" : showPassword ? "text" : "password";

  return (
    <>
      <AppInput {...props} type={inputType} disabled={isLoading}>
        <AppButton
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          intent="empty"
          icon={inputType === "password" ? EyeOff : Eye}
          disabled={isLoading}
          className="transition-all"
        />
      </AppInput>
    </>
  );
}
