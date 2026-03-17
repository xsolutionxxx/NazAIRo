import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordField from "@features/auth/ui/PasswordField";
import { AppButton } from "@shared/ui/appButton";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current passwrod is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Current passwrod is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Password do not match",
    path: ["confirmNewPassword"],
  });

type PasswordChangeFormFields = z.infer<typeof schema>;

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
    resolver: zodResolver(schema),
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
