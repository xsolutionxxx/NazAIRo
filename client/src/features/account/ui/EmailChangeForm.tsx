"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordField from "@features/auth/ui/PasswordField";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import {
  emailChangeSchema,
  EmailChangeFields,
} from "@shared/schemas/user-schema";

import { useAppDispatch } from "@/shared/lib/hooks/redux";
import { changeEmail } from "@/features/auth/model/authActions";

interface EmailChangeFormProps {
  onSuccess?: () => void;
}

export default function EmailChangeForm({ onSuccess }: EmailChangeFormProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [targetEmail, setTargetEmail] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailChangeFields>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  const onRequestSubmit: SubmitHandler<EmailChangeFields> = async (data) => {
    const resultAction = await dispatch(changeEmail(data)).unwrap();

    setResultMessage(resultAction.message || "some mess");
    setTargetEmail(data.newEmail);
    setStep("verify");
  };

  /* const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verifying code:", verificationCode, "for", targetEmail);

    if (onSuccess) onSuccess();
  }; */

  return (
    <div className="w-full">
      {step === "request" ? (
        <form
          onSubmit={handleSubmit(onRequestSubmit)}
          className="flex flex-col gap-10"
        >
          <AppInput
            {...register("newEmail")}
            label="New Email"
            labelClassName="bg-surface"
            placeholder="example@gmail.com"
            errorMsg={errors.newEmail?.message}
            disabled={isSubmitting}
          />
          <PasswordField
            {...register("password")}
            label="Password"
            labelClassName="bg-surface"
            placeholder="Confirm with your password"
            errorMsg={errors.password?.message}
            disabled={isSubmitting}
          />
          <AppButton type="submit" disabled={isSubmitting} className="w-full">
            Send Verification Code
          </AppButton>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <p>
            {resultMessage}
            <span>{targetEmail}</span>
          </p>
          <AppButton type="submit" className="w-full">
            OK
          </AppButton>
          <AppButton
            intent="ghost"
            type="button"
            onClick={() => setStep("request")}
            className="text-xs"
          >
            Back to edit email
          </AppButton>
        </div>
      )}
    </div>
  );
}
