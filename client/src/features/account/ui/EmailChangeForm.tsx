"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordField from "@features/auth/ui/PasswordField";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import { emailChangeSchema } from "@shared/schemas/user-schema.js";

type EmailRequestFields = z.infer<typeof emailChangeSchema>;

interface EmailChangeFormProps {
  onSuccess?: () => void;
}

export default function EmailChangeForm({ onSuccess }: EmailChangeFormProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [targetEmail, setTargetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailRequestFields>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: { email: "", password: "" },
  });

  const onRequestSubmit: SubmitHandler<EmailRequestFields> = async (data) => {
    console.log("Requesting change for:", data.email);

    setTargetEmail(data.email);
    setStep("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verifying code:", verificationCode, "for", targetEmail);

    if (onSuccess) onSuccess();
  };

  return (
    <div className="w-full">
      {step === "request" ? (
        <form
          onSubmit={handleSubmit(onRequestSubmit)}
          className="flex flex-col gap-10"
        >
          <AppInput
            {...register("email")}
            label="New Email"
            labelClassName="bg-surface"
            placeholder="example@gmail.com"
            errorMsg={errors.email?.message}
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
        <form
          onSubmit={handleVerify}
          className="flex flex-col gap-8 text-center"
        >
          <div>
            <p className="text-muted-foreground mb-2">
              We’ve sent a 6-digit code to
            </p>
            <span className="font-semibold text-foreground">{targetEmail}</span>
          </div>

          <div className="flex flex-col gap-2">
            <AppInput
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              label="Verification Code"
              labelClassName="bg-surface"
              placeholder="000000"
              className="text-center tracking-[1em] font-bold text-2xl"
              maxLength={6}
            />

            <AppButton intent="ghost" className="flex justify-end text-accent">
              Resend code
            </AppButton>
          </div>

          <div className="flex flex-col gap-3">
            <AppButton type="submit" className="w-full">
              Confirm Email Change
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
        </form>
      )}
    </div>
  );
}
