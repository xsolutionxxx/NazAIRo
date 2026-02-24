"use client";

import Link from "next/link";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import { PhoneField } from "./PhoneInput";
import AuthActions from "./AuthActions";
import PasswordInput from "./PasswordInput";

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phone: z.e164(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });

type SignUpFormFields = z.infer<typeof schema>;

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
      name: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<SignUpFormFields> = (data) => {
    const { confirmPassword, ...dataToSubmit } = data;

    console.log(dataToSubmit);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-10 w-full flex flex-col gap-10"
    >
      <div className="grid grid-cols-2 gap-y-10 gap-x-6">
        <AppInput
          {...register("name")}
          id="sign-up-first-name"
          placeholder="Your first name"
          label="first name"
          errorMsg={errors.name && errors.name?.message}
        />
        <AppInput
          {...register("lastName")}
          id="sign-up-last-name"
          placeholder="Your last name"
          label="last name"
          errorMsg={errors.lastName && errors.lastName?.message}
        />
        <AppInput
          {...register("email")}
          id="sign-up-email"
          placeholder="Your email"
          label="Email"
          errorMsg={errors.email && errors.email?.message}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <PhoneField {...field} errorMsg={fieldState.error?.message} />
          )}
        />
      </div>

      <PasswordInput
        {...register("password")}
        id="sign-up-password"
        placeholder="Come up with a password"
        label="Password"
        errorMsg={errors.password && errors.password?.message}
      />
      <PasswordInput
        {...register("confirmPassword")}
        id="sign-up-confirm-password"
        onChange={(e) => {
          register("password").onChange(e);
          trigger("confirmPassword");
        }}
        placeholder="Repeat the password"
        label="confirm password"
        errorMsg={errors.confirmPassword && errors.confirmPassword?.message}
      />

      <AppCheckbox
        {...register("terms")}
        id="terms"
        name="terms"
        errorMsg={errors.terms && errors.terms?.message}
        label={
          <span className="text-sm">
            I agree to all the{" "}
            <Link
              href="/terms"
              className="text-accent hover:underline transition-all"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policies"
              className="text-accent hover:underline transition-all"
            >
              Privacy Policies
            </Link>
          </span>
        }
      />

      <AuthActions type="sign up" isLoading={isSubmitting} />
    </form>
  );
}
