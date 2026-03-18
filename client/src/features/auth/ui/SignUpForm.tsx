"use client";

import Link from "next/link";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import { registrationSchema } from "@shared/schemas/auth-schema.js";

import PhoneField from "./PhoneField";
import AuthActions from "./AuthActions";
import PasswordField from "./PasswordField";

type SignUpFormFields = z.infer<typeof registrationSchema>;

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormFields>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onBlur",
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit: SubmitHandler<SignUpFormFields> = (data) => {
    const { confirmPassword, ...dataToSubmit } = data;

    console.log("Server received data:", dataToSubmit);

    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-10 w-full flex flex-col gap-10"
    >
      <div className="grid grid-cols-2 gap-y-10 gap-x-6">
        <AppInput
          {...register("firstName")}
          id="sign-up-first-name"
          autoComplete="given-name"
          spellCheck={false}
          placeholder="Your first name"
          label="First name"
          errorMsg={errors.firstName?.message}
          disabled={isSubmitting}
          containerClassName="col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-1"
        />
        <AppInput
          {...register("lastName")}
          id="sign-up-last-name"
          autoComplete="family-name"
          spellCheck={false}
          placeholder="Your last name"
          label="Last name"
          errorMsg={errors.lastName?.message}
          disabled={isSubmitting}
          containerClassName="col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-1"
        />

        <AppInput
          {...register("email")}
          id="sign-up-email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="Your email address"
          label="Email"
          errorMsg={errors.email?.message}
          disabled={isSubmitting}
          containerClassName="col-span-2 sm:col-span-1 md:col-span-2 xl:col-span-1"
        />
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <PhoneField
              {...field}
              errorMsg={fieldState.error?.message}
              isLoading={isSubmitting}
              containerClassName="col-span-2 sm:col-span-1 md:col-span-2 xl:col-span-1"
            />
          )}
        />
      </div>

      <PasswordField
        {...register("password")}
        id="sign-up-password"
        placeholder="Come up with a password"
        label="Password"
        errorMsg={errors.password?.message}
        isLoading={isSubmitting}
      />
      <PasswordField
        {...register("confirmPassword")}
        id="sign-up-confirm-password"
        onChange={(e) => {
          register("confirmPassword").onChange(e);
          trigger("password");
        }}
        placeholder="Repeat the password"
        label="Confirm password"
        errorMsg={errors.confirmPassword?.message}
        isLoading={isSubmitting}
      />

      <AppCheckbox
        {...register("terms")}
        id="terms"
        label={
          <span className="flex items-center gap-1.25 text-sm">
            I agree to all the
            <Link
              href="/terms"
              className="text-accent hover:underline transition-all"
            >
              Terms
            </Link>
            and
            <Link
              href="/privacy-policies"
              className="text-accent hover:underline transition-all"
            >
              Privacy Policies
            </Link>
          </span>
        }
        errorMsg={errors.terms?.message}
        disabled={isSubmitting}
      />

      <AuthActions type="sign up" isLoading={isSubmitting} />
    </form>
  );
}
