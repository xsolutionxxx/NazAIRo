import { z } from "zod";
import { emailField, passwordField, nameField, phoneField } from "./fields";

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const emailChangeSchema = z.object({
  newEmail: emailField,
  password: z.string().min(1, "Current password is required"),
});

export const profileSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  phone: phoneField,
});

export type PasswordChangeFields = z.infer<typeof passwordChangeSchema>;
export type EmailChangeFields = z.infer<typeof emailChangeSchema>;
export type ProfileFields = z.infer<typeof profileSchema>;
