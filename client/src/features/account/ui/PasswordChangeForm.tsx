import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import PasswordField from "@features/auth/ui/PasswordField";
import { AppButton } from "@shared/ui/appButton";
import { passwordChangeSchema } from "@shared/schemas/user-schema.js";

import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks/redux";
import { changePassword } from "../model/accountAction";

type PasswordChangeFormFields = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

export default function PasswordChangeForm({
  onSuccess,
}: PasswordChangeFormProps) {
  const dispatch = useAppDispatch();
  const { error: serverError, accountLoadingStatus } = useAppSelector(
    (state) => state.accountReducer,
  );

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

  const onSubmit: SubmitHandler<PasswordChangeFormFields> = async (data) => {
    const resultAction = await dispatch(changePassword(data));

    if (changePassword.fulfilled.match(resultAction)) {
      onSuccess?.();
      reset();
    }
  };

  const isLoading = accountLoadingStatus === "loading" || isSubmitting;

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
        disabled={isLoading}
      />

      <PasswordField
        {...register("newPassword")}
        spellCheck={false}
        placeholder="Create your new password"
        label="Сreate New Password"
        labelClassName="bg-surface"
        errorMsg={errors.newPassword?.message}
        disabled={isLoading}
      />

      <PasswordField
        {...register("confirmNewPassword")}
        spellCheck={false}
        placeholder="Repeat your new password"
        label="Repeat New Password"
        labelClassName="bg-surface"
        errorMsg={errors.confirmNewPassword?.message}
        disabled={isLoading}
      />

      {serverError && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {serverError}
        </div>
      )}

      <AppButton type="submit" disabled={isLoading} className="w-full">
        Update Password
      </AppButton>
    </form>
  );
}
