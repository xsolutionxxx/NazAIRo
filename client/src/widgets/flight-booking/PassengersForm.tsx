"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { AppInput } from "@shared/ui/appInput";
import { AppButton } from "@shared/ui/appButton";
import { User } from "lucide-react";

interface PassengerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
}

interface FormValues {
  passengers: PassengerData[];
}

interface Props {
  count: number;
  onSubmit: (passengers: PassengerData[]) => Promise<void>;
}

export default function PassengersForm({ count, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      passengers: Array.from({ length: count }, () => ({
        firstName: "", lastName: "", dateOfBirth: "", passportNumber: "", nationality: "",
      })),
    },
  });

  const submit = async (data: FormValues) => {
    await onSubmit(data.passengers);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-6">
        <h2 className="text-lg font-bold mb-6">Passenger Details</h2>

        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="mb-8 last:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center">
                <User size={14} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-sm">Passenger {i + 1}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AppInput
                label="First name"
                {...register(`passengers.${i}.firstName`, { required: "Required" })}
                errorMsg={errors.passengers?.[i]?.firstName?.message}
              />
              <AppInput
                label="Last name"
                {...register(`passengers.${i}.lastName`, { required: "Required" })}
                errorMsg={errors.passengers?.[i]?.lastName?.message}
              />
              <AppInput
                label="Date of birth"
                type="date"
                {...register(`passengers.${i}.dateOfBirth`, { required: "Required" })}
                errorMsg={errors.passengers?.[i]?.dateOfBirth?.message}
              />
              <AppInput
                label="Passport number"
                placeholder="AA1234567"
                {...register(`passengers.${i}.passportNumber`, {
                  required: "Required",
                  minLength: { value: 5, message: "Min 5 characters" },
                })}
                errorMsg={errors.passengers?.[i]?.passportNumber?.message}
              />
              <AppInput
                label="Nationality"
                placeholder="Ukraine"
                containerClassName="col-span-2"
                {...register(`passengers.${i}.nationality`, { required: "Required" })}
                errorMsg={errors.passengers?.[i]?.nationality?.message}
              />
            </div>

            {i < count - 1 && <hr className="mt-8 border-[#D7E2EE]" />}
          </div>
        ))}
      </div>

      <AppButton type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-base">
        {isSubmitting ? "Processing..." : "Continue to payment"}
      </AppButton>
    </form>
  );
}
