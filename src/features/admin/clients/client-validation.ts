import { z } from "zod";

export const clientStatusValues = ["active", "paused", "archived"] as const;

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email."),
  company: z.string().trim().optional(),
  status: z.enum(clientStatusValues),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;