"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, RefreshCw, ChevronLeft } from "lucide-react";

import PasswordField from "@features/auth/ui/PasswordField";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import {
  emailChangeSchema,
  EmailChangeFields,
} from "@shared/schemas/user-schema";
import $api from "@/shared/api";

import { useAppDispatch } from "@/shared/lib/hooks/redux";
import { changeEmail } from "@/features/auth/model/authActions";

interface EmailChangeFormProps {
  onSuccess?: () => void;
}

export default function EmailChangeForm({ onSuccess }: EmailChangeFormProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [targetEmail, setTargetEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EmailChangeFields>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (step !== "verify") return;

    const interval = setInterval(async () => {
      try {
        const { data } = await $api.get("/email-change-status");
        if (!data.isPending) {
          clearInterval(interval);
          onSuccess?.();
          /* toast.success("Email updated successfully!"); */
        }
      } catch {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, onSuccess]);

  const onRequestSubmit: SubmitHandler<EmailChangeFields> = async (data) => {
    try {
      setServerError(null);
      await dispatch(changeEmail(data)).unwrap();
      setTargetEmail(data.newEmail);
      setResendTimer(60);
      setStep("verify");
    } catch (error) {
      setServerError(error as string);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      setIsResending(true);
      setServerError(null);

      const statusResponse = await $api.get("/email-change-status");
      if (!statusResponse.data.isPending) {
        onSuccess?.();
        return;
      }

      const data = getValues();
      await dispatch(changeEmail(data)).unwrap();
      setResendTimer(60);
    } catch (error) {
      setServerError(error as string);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      {step === "request" ? (
        <form
          onSubmit={handleSubmit(onRequestSubmit)}
          className="flex flex-col gap-8"
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

          {serverError && (
            <div className="p-3 text-sm text-white bg-destructive rounded-md">
              {serverError}
            </div>
          )}

          <AppButton type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending..." : "Send Verification Link"}
          </AppButton>
        </form>
      ) : (
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MailCheck className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-xl font-bold mb-2 text-foreground">
            Check your inbox
          </h3>

          <p className="mb-5 px-4 text-sm text-muted-foreground pointer-events-none">
            We&apos;ve sent a verification link to <br />
            <span className="font-semibold block mt-1 text-base">
              {targetEmail}
            </span>
          </p>

          <AppButton
            intent="ghost"
            disabled={resendTimer > 0 || isResending}
            onClick={handleResend}
            className="mb-2 w-full gap-2 text-xs font-normal tabular-nums md:hover:text-destructive md:hover:scale-100"
          >
            {resendTimer > 0 ? (
              `Resend link in ${resendTimer}s`
            ) : (
              <>
                <RefreshCw
                  className={`w-3 h-3 ${isSubmitting ? "animate-spin" : ""}`}
                />
                Didn&apos;t receive the email? Resend
              </>
            )}
          </AppButton>

          {serverError && (
            <p className="mt-2 text-sm text-destructive">{serverError}</p>
          )}

          <AppButton className="w-full" onClick={() => onSuccess?.()}>
            Got it, thanks
          </AppButton>

          <AppButton
            intent="ghost"
            className="font-normal md:hover:scale-100"
            onClick={() => setStep("request")}
          >
            <ChevronLeft className="w-3 h-3" />
            Back to edit email
          </AppButton>
        </div>
      )}
    </div>
  );
}
