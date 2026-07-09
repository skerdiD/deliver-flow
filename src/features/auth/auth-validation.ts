import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(80, "Workspace name must be 80 characters or less."),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be 80 characters or less."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export type SignupValues = z.infer<typeof signupSchema>;
