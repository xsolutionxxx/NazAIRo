import { z } from "zod";
import { emailField, passwordField, nameField, phoneField } from "./fields.js";

export const registrationSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  email: emailField,
  phone: phoneField,
  password: passwordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
