"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import { loginSchema } from "@shared/schemas/auth-schema.js";

import AuthActions from "./AuthActions";
import PasswordField from "./PasswordField";

import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { login } from "../model/authActions";

type LoginFormFields = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const { error: serverError, authLoadingStatus } = useAppSelector(
    (state) => state.authReducer,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormFields>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    const resultAction = await dispatch(login(data));

    if (login.fulfilled.match(resultAction)) {
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
      <AppInput
        {...register("email")}
        id="login-email"
        type="email"
        autoComplete="email"
        spellCheck={false}
        placeholder="Enter your email address"
        label="Email"
        errorMsg={errors.email?.message}
        disabled={isLoading}
      />
      <PasswordField
        {...register("password")}
        id="login-password"
        autoComplete="current-password"
        placeholder="Enter your password"
        label="Password"
        spellCheck={false}
        errorMsg={errors.password?.message}
        isLoading={isLoading}
      />

      <div className="flex justify-between">
        <AppCheckbox
          {...register("rememberMe")}
          id="remember-me"
          label="Remember me"
          disabled={isLoading}
        />
        <Link
          href="/forgot-password"
          className="font-medium text-sm text-accent hover:underline transition-all capitalize"
        >
          forgot password
        </Link>
      </div>

      {serverError && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {serverError}
        </div>
      )}

      <AuthActions type="login" isLoading={isLoading} />
    </form>
  );
}
