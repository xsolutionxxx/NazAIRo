import { z } from "zod";

export const registrationSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(40),
    lastName: z.string().trim().min(1, "Last name is required").max(40),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phone: z.e164({ message: "Invalid phone format" }),
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

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});
