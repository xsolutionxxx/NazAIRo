"use client";

import { redirect } from "next/navigation";
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

import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks/redux";
import { registration } from "../model/authActions";

type SignUpFormFields = z.infer<typeof registrationSchema>;

export default function SignUpForm() {
  const dispatch = useAppDispatch();
  const { error: serverError, authLoadingStatus } = useAppSelector(
    (state) => state.authReducer,
  );

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

  const onSubmit: SubmitHandler<SignUpFormFields> = async (data) => {
    const resultAction = await dispatch(registration(data));

    if (registration.fulfilled.match(resultAction)) {
      reset();
      redirect("/account");
    }
  };

  const isLoading = authLoadingStatus === "loading" || isSubmitting;

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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
          containerClassName="col-span-2 sm:col-span-1 md:col-span-2 xl:col-span-1"
        />
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <PhoneField
              {...field}
              errorMsg={fieldState.error?.message}
              isLoading={isLoading}
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
        isLoading={isLoading}
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
        isLoading={isLoading}
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
        disabled={isLoading}
      />

      {serverError && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {serverError}
        </div>
      )}

      <AuthActions type="sign up" isLoading={isLoading} />
    </form>
  );
}
