import { z } from "zod";

export const inviteClientSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email.")
    .max(254, "Email is too long."),
  name: z
    .string()
    .trim()
    .min(1, "Client name is required.")
    .max(120, "Client name is too long."),
  company: z.string().trim().max(160, "Company is too long.").optional(),
  expiresInDays: z.coerce
    .number()
    .int()
    .min(1, "Invite must last at least 1 day.")
    .max(30, "Invite cannot last more than 30 days."),
});

export type InviteClientValues = z.infer<typeof inviteClientSchema>;
