"use client";

import { useForm } from "react-hook-form";
import { AppInput } from "@shared/ui/appInput";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import { Check, UserCheck } from "lucide-react";
import type { IUser } from "@entities/user/types/IUser";
import type { IHotelGuest } from "@entities/hotel/types/IHotel";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={cn("text-xs font-medium", error ? "text-destructive" : "text-foreground-muted")}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface Props {
  guestCount: number;
  user?: IUser | null;
  onSubmit: (guest: IHotelGuest) => Promise<void>;
}

export default function HotelGuestForm({ guestCount, user, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName:       user?.firstName ?? "",
      lastName:        user?.lastName  ?? "",
      email:           user?.email     ?? "",
      phone:           user?.phone     ?? "",
      specialRequests: "",
    },
  });

  const submit = async (data: FormValues) => {
    await onSubmit({
      firstName:       data.firstName,
      lastName:        data.lastName,
      email:           data.email           || undefined,
      phone:           data.phone           || undefined,
      specialRequests: data.specialRequests || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-1">Guest details</h2>
        <p className="text-sm text-foreground-muted mb-5">
          {guestCount} guest{guestCount !== 1 ? "s" : ""} · Main contact person for this booking
        </p>

        {/* Pre-filled notice */}
        {user && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-5">
            <UserCheck size={15} className="text-primary shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-foreground">Pre-filled from your account. Update if needed.</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" error={errors.firstName?.message}>
              <AppInput
                placeholder="John"
                {...register("firstName", {
                  required: "Required",
                  minLength: { value: 2, message: "Min 2 characters" },
                  pattern: { value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/, message: "Letters only" },
                })}
                errorMsg={undefined}
              />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <AppInput
                placeholder="Doe"
                {...register("lastName", {
                  required: "Required",
                  minLength: { value: 2, message: "Min 2 characters" },
                  pattern: { value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/, message: "Letters only" },
                })}
                errorMsg={undefined}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" error={errors.email?.message}>
              <AppInput
                type="email"
                placeholder="john@email.com"
                {...register("email", {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                })}
                errorMsg={undefined}
              />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <AppInput
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone")}
                errorMsg={undefined}
              />
            </Field>
          </div>

          <Field label="Special requests (optional)" error={errors.specialRequests?.message}>
            <textarea
              placeholder="Early check-in, high floor, extra pillows, anniversary celebration…"
              {...register("specialRequests")}
              rows={3}
              className={cn(
                "w-full px-4 py-3 border-2 border-input-secondary rounded-xl bg-transparent text-sm",
                "outline-none transition-colors resize-none",
                "hover:border-primary focus:border-primary placeholder:text-foreground-muted/50",
              )}
            />
            <p className="text-xs text-foreground-muted -mt-0.5">Special requests are not guaranteed but we'll do our best</p>
          </Field>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex gap-3">
        <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Free cancellation</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
            Cancel for free before check-in. No fees, no questions asked.
          </p>
        </div>
      </div>

      <AppButton type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-base">
        {isSubmitting ? "Processing…" : "Continue to payment"}
      </AppButton>
    </form>
  );
}
