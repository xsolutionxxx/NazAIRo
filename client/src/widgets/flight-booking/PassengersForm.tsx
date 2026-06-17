"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { AppInput } from "@shared/ui/appInput";
import { AppButton } from "@shared/ui/appButton";
import { AppSelect } from "@shared/ui/appSelect";
import { DatePicker } from "@shared/ui/datePicker";
import { cn } from "@shared/lib/utils";
import { User } from "lucide-react";

/* ─── constants (stable, module-level) ─────────────────────────── */
const today    = new Date().toISOString().split("T")[0];
const minBirth = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split("T")[0];
const minExpiry = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
})();

const TITLE_OPTIONS = [
  { value: "MR",   label: "Mr"   },
  { value: "MRS",  label: "Mrs"  },
  { value: "MS",   label: "Ms"   },
  { value: "MISS", label: "Miss" },
];

/* ─── field wrapper ─────────────────────────────────────────────── */
function PField({
  label, error, children, className,
}: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className={cn("text-xs font-medium", error ? "text-destructive" : "text-foreground-muted")}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive leading-tight">{error}</p>}
    </div>
  );
}

/* ─── types ─────────────────────────────────────────────────────── */
interface PassengerData {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
}
interface FormValues { passengers: PassengerData[] }
interface Props { count: number; onSubmit: (p: PassengerData[]) => Promise<void> }

/* ─── component ─────────────────────────────────────────────────── */
export default function PassengersForm({ count, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      passengers: Array.from({ length: count }, () => ({
        title: "MR", firstName: "", lastName: "",
        dateOfBirth: "", passportNumber: "", passportExpiry: "", nationality: "",
      })),
    },
  });

  // Local date state — source of truth for DatePicker display.
  // Kept separate from RHF to prevent cross-picker interference when RHF re-renders.
  const [dates, setDates] = React.useState<Array<{ dob: string; expiry: string }>>(() =>
    Array.from({ length: count }, () => ({ dob: "", expiry: "" })),
  );

  const setDob = React.useCallback((i: number, v: string) => {
    setDates((prev) => prev.map((d, idx) => idx === i ? { ...d, dob: v } : d));
    setValue(`passengers.${i}.dateOfBirth` as const, v, { shouldValidate: false });
  }, [setValue]);

  const setExpiry = React.useCallback((i: number, v: string) => {
    setDates((prev) => prev.map((d, idx) => idx === i ? { ...d, expiry: v } : d));
    setValue(`passengers.${i}.passportExpiry` as const, v, { shouldValidate: false });
  }, [setValue]);

  const passengers = watch("passengers");

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d.passengers))} className="space-y-6">
      <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-6">Passenger Details</h2>

        {Array.from({ length: count }).map((_, i) => {
          const e = errors.passengers?.[i];
          const p = passengers?.[i];

          return (
            <div key={i} className="mb-8 last:mb-0">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center shrink-0">
                  <User size={14} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-sm">Passenger {i + 1}</h3>
              </div>

              {/* Register hidden inputs for date fields so RHF tracks them */}
              <input type="hidden" {...register(`passengers.${i}.dateOfBirth`, {
                required: "Required",
                validate: (v) => {
                  if (!v) return "Required";
                  if (v > today) return "Cannot be in the future";
                  if (v < minBirth) return "Invalid date of birth";
                  return true;
                },
              })} />
              <input type="hidden" {...register(`passengers.${i}.passportExpiry`, {
                required: "Required",
                validate: (v) => !v
                  ? "Required"
                  : v >= minExpiry || "Passport must be valid for at least 6 months after travel",
              })} />
              <input type="hidden" {...register(`passengers.${i}.title`, { required: "Required" })} />

              <div className="space-y-4">
                {/* Title + First + Last */}
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-4">
                  <AppSelect
                    label="Title"
                    value={p?.title ?? "MR"}
                    onChange={(v) => setValue(`passengers.${i}.title`, v, { shouldValidate: false })}
                    options={TITLE_OPTIONS}
                    error={e?.title?.message}
                  />
                  <PField label="First name" error={e?.firstName?.message}>
                    <AppInput
                      placeholder="John"
                      {...register(`passengers.${i}.firstName`, {
                        required: "Required",
                        minLength: { value: 2, message: "Min 2 characters" },
                        maxLength: { value: 50, message: "Max 50 characters" },
                        pattern: { value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/, message: "Letters only" },
                      })}
                      errorMsg={undefined}
                    />
                  </PField>
                  <PField label="Last name" error={e?.lastName?.message}>
                    <AppInput
                      placeholder="Doe"
                      {...register(`passengers.${i}.lastName`, {
                        required: "Required",
                        minLength: { value: 2, message: "Min 2 characters" },
                        maxLength: { value: 50, message: "Max 50 characters" },
                        pattern: { value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/, message: "Letters only" },
                      })}
                      errorMsg={undefined}
                    />
                  </PField>
                </div>

                {/* DOB + Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DatePicker
                    label="Date of birth"
                    placeholder="DD MMM YYYY"
                    value={dates[i]?.dob}
                    errorMsg={e?.dateOfBirth?.message}
                    onChange={(v) => setDob(i, v)}
                  />
                  <PField label="Nationality" error={e?.nationality?.message}>
                    <AppInput
                      placeholder="Ukrainian"
                      {...register(`passengers.${i}.nationality`, {
                        required: "Required",
                        minLength: { value: 2, message: "Min 2 characters" },
                        pattern: { value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, message: "Letters only" },
                      })}
                      errorMsg={undefined}
                    />
                  </PField>
                </div>

                {/* Passport number + expiry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PField label="Passport number" error={e?.passportNumber?.message}>
                    <AppInput
                      placeholder="AA1234567"
                      {...register(`passengers.${i}.passportNumber`, {
                        required: "Required",
                        pattern: { value: /^[A-Z0-9]{6,9}$/i, message: "6–9 alphanumeric chars (ICAO)" },
                        onChange: (e) => { e.target.value = e.target.value.toUpperCase(); },
                      })}
                      errorMsg={undefined}
                    />
                  </PField>
                  <DatePicker
                    label="Passport expiry date"
                    placeholder="DD MMM YYYY"
                    value={dates[i]?.expiry}
                    min={minExpiry}
                    errorMsg={e?.passportExpiry?.message}
                    onChange={(v) => setExpiry(i, v)}
                  />
                </div>
              </div>

              {i < count - 1 && <hr className="mt-8 border-[#D7E2EE]" />}
            </div>
          );
        })}
      </div>

      <AppButton type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-base">
        {isSubmitting ? "Processing..." : "Continue to seat selection"}
      </AppButton>
    </form>
  );
}
