import { z } from "zod";

export const inviteTokenSchema = z
  .string()
  .trim()
  .min(32, "Invite token is invalid.")
  .max(256, "Invite token is invalid.")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invite token is invalid.");

export const acceptInviteSchema = z.object({
  token: inviteTokenSchema,
});
