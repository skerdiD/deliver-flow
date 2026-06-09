import { z } from "zod";

export const clientFeedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, "Please write a little more detail.")
    .max(800, "Feedback should stay under 800 characters."),
});

export const clientApprovalResponseSchema = z.object({
  responseNote: z.string().trim().max(800).optional(),
});

export type ClientFeedbackValues = z.infer<typeof clientFeedbackSchema>;
export type ClientApprovalResponseValues = z.infer<
  typeof clientApprovalResponseSchema
>;