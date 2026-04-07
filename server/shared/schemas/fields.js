import { z } from "zod";

export const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(255, "Email is too long")
  .toLowerCase();

export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /^[a-zA-Z0-9.,!@#$%^&*()_+={}\[\]:;"'<>,.?/-]+$/,
    "Only Latin letters and standard symbols are allowed",
  )
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const nameField = z
  .string()
  .trim()
  .min(1, "This field is required")
  .max(40, "Must be at most 40 characters")
  .regex(
    /^[a-zA-Zа-яА-ЯёЁіІїЇєЄ'\- ]+$/,
    "Only letters, hyphens and apostrophes are allowed",
  );

export const phoneField = z.e164({ message: "Invalid phone format" });
