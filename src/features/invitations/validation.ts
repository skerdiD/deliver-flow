import { z } from "zod";

export const inviteTokenSchema = z
  .string()
  .trim()
  .min(32, "Invite token is invalid.")
  .max(256, "Invite token is invalid.")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invite token is invalid.");

export const invitePasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(128, "Password is too long.")
  .regex(/[a-z]/, "Password needs a lowercase letter.")
  .regex(/[A-Z]/, "Password needs an uppercase letter.")
  .regex(/[0-9]/, "Password needs a number.");

export const acceptInviteSchema = z.object({
  token: inviteTokenSchema,
  password: invitePasswordSchema,
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
