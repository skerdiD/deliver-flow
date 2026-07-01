import { z } from "zod";

export const clientProjectIdSchema = z.string().uuid("Project id is invalid.");
export const clientApprovalIdSchema = z
  .string()
  .uuid("Approval id is invalid.");

export const clientApprovalStatusValues = [
  "approved",
  "changes_requested",
] as const;

export const clientFeedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, "Please write a little more detail.")
    .max(800, "Feedback should stay under 800 characters."),
});

export const clientApprovalResponseSchema = z.object({
  responseNote: z
    .string()
    .trim()
    .max(800, "Approval note should stay under 800 characters.")
    .optional(),
});

export const clientApprovalActionSchema = clientApprovalResponseSchema.extend({
  status: z.enum(clientApprovalStatusValues),
});

export const clientApprovalChangeRequestSchema =
  clientApprovalResponseSchema.extend({
    status: z.literal("changes_requested"),
    responseNote: z
      .string()
      .trim()
      .min(5, "Please add a short note before requesting changes.")
      .max(800, "Approval note should stay under 800 characters."),
  });

export type ClientFeedbackValues = z.infer<typeof clientFeedbackSchema>;
export type ClientApprovalResponseValues = z.infer<
  typeof clientApprovalResponseSchema
>;
