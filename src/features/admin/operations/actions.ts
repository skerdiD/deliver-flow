"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { feedback, tasks } from "@/db/schema";
import { requireRole } from "@/lib/supabase/auth";
import type { FeedbackStatus } from "@/types/database";

export async function markAdminTaskCompleteAction(input: {
  taskId: string;
  projectId: string;
}) {
  await requireRole("admin");

  await db
    .update(tasks)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.projectId, input.projectId)));

  revalidatePath(routes.admin.tasks);
  revalidatePath(routes.admin.projects);
  revalidatePath(`${routes.admin.projects}/${input.projectId}`);
}

export async function updateAdminFeedbackStatusAction(input: {
  feedbackId: string;
  status: FeedbackStatus;
}) {
  await requireRole("admin");

  await db
    .update(feedback)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(feedback.id, input.feedbackId));

  revalidatePath(routes.admin.feedback);
}
