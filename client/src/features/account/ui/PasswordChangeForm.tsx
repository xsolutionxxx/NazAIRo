import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import PasswordField from "@features/auth/ui/PasswordField";
import { AppButton } from "@shared/ui/appButton";
import { passwordChangeSchema } from "@shared/schemas/user-schema.js";

type PasswordChangeFormFields = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

export default function PasswordChangeForm({
  onSuccess,
}: PasswordChangeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormFields>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onBlur",
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit: SubmitHandler<PasswordChangeFormFields> = (data) => {
    console.log(data);

    reset();

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      <PasswordField
        {...register("currentPassword")}
        autoComplete="current-password"
        spellCheck={false}
        label="Current Password"
        labelClassName="bg-surface"
        placeholder="Enter your current password"
        errorMsg={errors.currentPassword?.message}
        disabled={isSubmitting}
      />
      <PasswordField
        {...register("newPassword")}
        spellCheck={false}
        placeholder="Create your new password"
        label="Сreate New Password"
        labelClassName="bg-surface"
        errorMsg={errors.newPassword?.message}
        disabled={isSubmitting}
      />
      <PasswordField
        {...register("confirmNewPassword")}
        spellCheck={false}
        placeholder="Repeat your new password"
        label="Repeat New Password"
        labelClassName="bg-surface"
        errorMsg={errors.confirmNewPassword?.message}
        disabled={isSubmitting}
      />
      <AppButton type="submit" disabled={isSubmitting} className="w-full">
        Update Password
      </AppButton>
    </form>
  );
}
