"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppInput } from "@shared/ui/appInput";
import { AppCheckbox } from "@shared/ui/appCheckbox";
import AuthActions from "./AuthActions";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    lastName: z.string(),
    email: z.string().email("Invalid email format"),
    phone: z.e164(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean(),
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
    formState: { errors },
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
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<SignUpFormFields> = (data) => {
    console.log(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-10 w-full flex flex-col gap-6"
    >
      <div className="grid grid-cols-2 gap-6">
        <AppInput
          {...register("name")}
          id="sign-up-first-name"
          name="first-name"
          placeholder="Your first name"
          label="first name"
          errorMsg={errors.name && errors.name?.message}
        />
        <AppInput
          {...register("lastName")}
          id="sign-up-last-name"
          name="last-name"
          placeholder="Your last name"
          label="last name"
        />
        <AppInput
          {...register("email")}
          id="sign-up-email"
          name="email"
          placeholder="Your email"
          label="Email"
        />
        <AppInput
          {...register("phone")}
          id="sign-up-phone"
          name="phone"
          placeholder="Your number"
          label="phone number"
        />
      </div>

      <AppInput
        {...register("password")}
        id="sign-up-password"
        name="password"
        placeholder="Come up with a password"
        label="Password"
      />
      <AppInput
        {...register("confirmPassword")}
        id="sign-up-confirm-password"
        name="confirm-password"
        placeholder="Repeat the password"
        label="confirm password"
      />

      <AppCheckbox
        {...register("terms")}
        id="terms"
        name="terms"
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

      <AuthActions type="sign up" />
    </form>
  );
}
