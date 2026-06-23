"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { feedback, tasks } from "@/db/schema";
import { requireRole } from "@/lib/supabase/auth";

type AdminOperationActionResult = {
  success: boolean;
  message: string;
};

const markAdminTaskCompleteSchema = z.object({
  taskId: z.string().uuid("Task id is invalid."),
  projectId: z.string().uuid("Project id is invalid."),
});

const updateAdminFeedbackStatusSchema = z.object({
  feedbackId: z.string().uuid("Feedback id is invalid."),
  status: z.enum(["reviewed", "resolved"]),
});

export async function markAdminTaskCompleteAction(input: {
  taskId: string;
  projectId: string;
}): Promise<AdminOperationActionResult> {
  await requireRole("admin");

  const parsed = markAdminTaskCompleteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Task request is invalid.",
    };
  }

  try {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tasks.id, parsed.data.taskId),
          eq(tasks.projectId, parsed.data.projectId),
        ),
      )
      .returning({ id: tasks.id });

    if (!updatedTask) {
      return {
        success: false,
        message: "Task not found.",
      };
    }

    revalidatePath(routes.admin.tasks);
    revalidatePath(routes.admin.projects);
    revalidatePath(`${routes.admin.projects}/${parsed.data.projectId}`);

    return {
      success: true,
      message: "Task completed.",
    };
  } catch {
    return {
      success: false,
      message: "Task could not be updated.",
    };
  }
}

export async function updateAdminFeedbackStatusAction(input: {
  feedbackId: string;
  status: "reviewed" | "resolved";
}): Promise<AdminOperationActionResult> {
  await requireRole("admin");

  const parsed = updateAdminFeedbackStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Feedback request is invalid.",
    };
  }

  try {
    const [updatedFeedback] = await db
      .update(feedback)
      .set({
        status: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, parsed.data.feedbackId))
      .returning({ id: feedback.id });

    if (!updatedFeedback) {
      return {
        success: false,
        message: "Feedback not found.",
      };
    }

    revalidatePath(routes.admin.feedback);

    return {
      success: true,
      message: "Feedback status updated.",
    };
  } catch {
    return {
      success: false,
      message: "Feedback status could not be updated.",
    };
  }
}
