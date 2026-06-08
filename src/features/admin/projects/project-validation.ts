import { z } from "zod";

export const projectStatusValues = [
  "active",
  "in_progress",
  "waiting_feedback",
  "completed",
  "archived",
] as const;

export const paymentStatusValues = [
  "paid",
  "unpaid",
  "partial",
  "overdue",
] as const;

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required."),
  clientId: z.string().trim().min(1, "Choose a client."),
  description: z.string().trim().min(1, "Project description is required."),
  status: z.enum(projectStatusValues),
  progress: z.coerce
    .number()
    .min(0, "Progress cannot be below 0.")
    .max(100, "Progress cannot be above 100."),
  deadline: z.string().trim().min(1, "Deadline is required."),
  liveDemoUrl: z
    .string()
    .trim()
    .url("Enter a valid live demo URL.")
    .optional()
    .or(z.literal("")),
  repositoryUrl: z
    .string()
    .trim()
    .url("Enter a valid repository URL.")
    .optional()
    .or(z.literal("")),
  paymentStatus: z.enum(paymentStatusValues),
  budgetDollars: z.coerce.number().min(0, "Budget cannot be negative."),
  paidDollars: z.coerce.number().min(0, "Paid amount cannot be negative."),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Task title is required."),
  description: z.string().trim().min(1, "Task description is required."),
  dueDate: z.string().trim().min(1, "Due date is required."),
});

export const milestoneFormSchema = z.object({
  title: z.string().trim().min(1, "Milestone title is required."),
  description: z.string().trim().min(1, "Milestone description is required."),
  dueDate: z.string().trim().min(1, "Due date is required."),
});

export const updateFormSchema = z.object({
  title: z.string().trim().min(1, "Update title is required."),
  body: z.string().trim().min(1, "Update body is required."),
});

export const progressFormSchema = z.object({
  progress: z.coerce
    .number()
    .min(0, "Progress cannot be below 0.")
    .max(100, "Progress cannot be above 100."),
  status: z.enum(projectStatusValues),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;
export type UpdateFormValues = z.infer<typeof updateFormSchema>;
export type ProgressFormValues = z.infer<typeof progressFormSchema>;