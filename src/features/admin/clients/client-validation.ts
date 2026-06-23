import { z } from "zod";

export const clientStatusValues = ["active", "paused", "archived"] as const;

export const clientRouteIdSchema = z
  .string()
  .trim()
  .min(1, "Client id is required.")
  .max(120, "Client id is too long.")
  .regex(/^[a-zA-Z0-9_-]+$/, "Client id is invalid.");

export const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email.")
    .max(254, "Email is too long."),
  company: z.string().trim().max(160, "Company is too long.").optional(),
  status: z.enum(clientStatusValues),
});

export const clientIdActionSchema = z.object({
  clientId: clientRouteIdSchema,
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
