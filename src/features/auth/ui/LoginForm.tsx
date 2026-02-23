"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import AuthActions from "./AuthActions";
import PasswordInput from "./PasswordInput";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

type LoginFormFields = z.infer<typeof schema>;

export default function LoginForm() {
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
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginFormFields> = (data) => {
    console.log(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-10 w-full flex flex-col gap-10"
    >
      <AppInput
        {...register("email")}
        id="login-email"
        name="email"
        placeholder="Enter your email address"
        label="Email"
        errorMsg={errors.email && errors.email?.message}
      />
      <PasswordInput
        {...register("password")}
        id="login-password"
        name="password"
        placeholder="Enter your password"
        label="Password"
        errorMsg={errors.password && errors.password?.message}
      />

      <div className="flex justify-between">
        <AppCheckbox
          {...register("rememberMe")}
          id="remember-me"
          name="rememberMe"
          label="Remember me"
        />
        <Link
          href="/"
          className="font-medium text-sm text-accent hover:underline transition-all capitalize"
        >
          forgot password
        </Link>
      </div>

      <AuthActions type="login" isLoading={isSubmitting} />
    </form>
  );
}
