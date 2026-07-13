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

export const projectRouteIdSchema = z
  .string()
  .trim()
  .min(1, "Project id is required.")
  .max(120, "Project id is too long.")
  .regex(/^[a-zA-Z0-9_-]+$/, "Project id is invalid.");

export const projectItemRouteIdSchema = z
  .string()
  .trim()
  .min(1, "Item id is required.")
  .max(120, "Item id is too long.")
  .regex(/^[a-zA-Z0-9_-]+$/, "Item id is invalid.");

const dateInputSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "URL is too long.")
  .url("Enter a valid URL.")
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }, "URL must use http or https.")
  .optional()
  .or(z.literal(""));

export const projectFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required.")
      .max(120, "Project name is too long."),
    clientId: projectRouteIdSchema,
    description: z
      .string()
      .trim()
      .min(1, "Project description is required.")
      .max(1200, "Project description is too long."),
    status: z.enum(projectStatusValues),
    progress: z.coerce
      .number()
      .int("Progress must be a whole number.")
      .min(0, "Progress cannot be below 0.")
      .max(100, "Progress cannot be above 100."),
    deadline: dateInputSchema,
    liveDemoUrl: optionalUrlSchema,
    repositoryUrl: optionalUrlSchema,
    paymentStatus: z.enum(paymentStatusValues),
    budgetDollars: z.coerce
      .number()
      .min(0, "Budget cannot be negative.")
      .max(10_000_000, "Budget is too large."),
    paidDollars: z.coerce
      .number()
      .min(0, "Paid amount cannot be negative.")
      .max(10_000_000, "Paid amount is too large."),
  })
  .refine((values) => values.paidDollars <= values.budgetDollars, {
    message: "Paid amount cannot exceed the project budget.",
    path: ["paidDollars"],
  });

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(160, "Task title is too long."),
  description: z
    .string()
    .trim()
    .min(1, "Task description is required.")
    .max(1000, "Task description is too long."),
  dueDate: dateInputSchema,
});

export const milestoneFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title is required.")
    .max(160, "Milestone title is too long."),
  description: z
    .string()
    .trim()
    .min(1, "Milestone description is required.")
    .max(1000, "Milestone description is too long."),
  dueDate: dateInputSchema,
});

export const updateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Update title is required.")
    .max(160, "Update title is too long."),
  body: z
    .string()
    .trim()
    .min(1, "Update body is required.")
    .max(2000, "Update body is too long."),
});

export const progressFormSchema = z.object({
  progress: z.coerce
    .number()
    .int("Progress must be a whole number.")
    .min(0, "Progress cannot be below 0.")
    .max(100, "Progress cannot be above 100."),
  status: z.enum(projectStatusValues),
});

export const projectIdActionSchema = z.object({
  projectId: projectRouteIdSchema,
});

export const projectItemActionSchema = z.object({
  projectId: projectRouteIdSchema,
  itemId: projectItemRouteIdSchema,
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;
export type UpdateFormValues = z.infer<typeof updateFormSchema>;
export type ProgressFormValues = z.infer<typeof progressFormSchema>;
