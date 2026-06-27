"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { routes } from "@/config/routes";
import { db } from "@/db";
import {
  approvals,
  milestones,
  payments,
  projectFiles,
  projects,
} from "@/db/schema";
import {
  addProjectMilestone,
  addProjectTask,
  addProjectUpdate,
  createAdminProject,
  markProjectMilestoneComplete,
  markProjectTaskComplete,
  updateAdminProject,
  updateProjectProgress,
} from "@/features/admin/projects/projects-data";
import {
  milestoneFormSchema,
  progressFormSchema,
  projectIdActionSchema,
  projectFormSchema,
  projectItemActionSchema,
  taskFormSchema,
  updateFormSchema,
  type MilestoneFormValues,
  type ProgressFormValues,
  type ProjectFormValues,
  type TaskFormValues,
  type UpdateFormValues,
} from "@/features/admin/projects/project-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/supabase/auth";

export type ProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
};

export type ProjectApprovalRequestValues = {
  title: string;
  description: string;
  milestoneId?: string;
};

export type ProjectPaymentValues = {
  amountDollars: number;
  status: "unpaid" | "partial" | "paid" | "overdue";
  dueDate?: string;
  notes?: string;
};

const uuidSchema = z.string().uuid();

const approvalRequestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(1200),
  milestoneId: z.string().uuid().optional().or(z.literal("")),
});

const paymentRecordSchema = z.object({
  amountDollars: z.coerce.number().positive().max(10_000_000),
  status: z.enum(["unpaid", "partial", "paid", "overdue"]),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
});

const paymentStatusSchema = z.object({
  projectId: uuidSchema,
  paymentId: uuidSchema,
  status: z.enum(["unpaid", "partial", "paid", "overdue"]),
});

const projectFileCategorySchema = z.enum([
  "brief",
  "design",
  "document",
  "invoice",
  "deliverable",
  "other",
]);

function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "Client not found.") {
    return error.message;
  }

  return fallback;
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function revalidateProjectWorkflow(projectId: string) {
  revalidatePath(routes.admin.projects);
  revalidatePath(`${routes.admin.projects}/${projectId}`);
  revalidatePath(routes.admin.approvals);
  revalidatePath(routes.admin.files);
  revalidatePath(routes.admin.payments);
  revalidatePath(routes.client.dashboard);
  revalidatePath(routes.client.project);
  revalidatePath(`${routes.client.project}/${projectId}`);
  revalidatePath(routes.client.files);
  revalidatePath(routes.client.payments);
}

export async function createProjectAction(
  values: ProjectFormValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const parsed = projectFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the project form fields.",
    };
  }

  try {
    const project = await createAdminProject(parsed.data);

    revalidatePath("/admin/projects");

    return {
      success: true,
      message: "Project created.",
      projectId: project.id,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Project could not be created."),
    };
  }
}

export async function updateProjectAction(
  id: string,
  values: ProjectFormValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const idParsed = projectIdActionSchema.safeParse({ projectId: id });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = projectFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the project form fields.",
    };
  }

  try {
    const project = await updateAdminProject(idParsed.data.projectId, parsed.data);

    if (!project) {
      return {
        success: false,
        message: "Project not found.",
      };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${idParsed.data.projectId}`);

    return {
      success: true,
      message: "Project saved.",
      projectId: project.id,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Project could not be saved."),
    };
  }
}

export async function updateProjectProgressAction(
  id: string,
  values: ProgressFormValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const idParsed = projectIdActionSchema.safeParse({ projectId: id });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = progressFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Progress must be between 0 and 100.",
    };
  }

  const project = await updateProjectProgress(idParsed.data.projectId, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${idParsed.data.projectId}`);

  return {
    success: true,
    message: "Project progress updated.",
    projectId: idParsed.data.projectId,
  };
}

export async function addTaskAction(
  projectId: string,
  values: TaskFormValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const idParsed = projectIdActionSchema.safeParse({ projectId });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = taskFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add a task title, description, and due date.",
    };
  }

  const project = await addProjectTask(idParsed.data.projectId, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${idParsed.data.projectId}`);

  return {
    success: true,
    message: "Task added.",
    projectId: idParsed.data.projectId,
  };
}

export async function markTaskCompleteAction(
  projectId: string,
  taskId: string,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const parsed = projectItemActionSchema.safeParse({
    projectId,
    itemId: taskId,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Task id is invalid.",
    };
  }

  await markProjectTaskComplete(parsed.data.projectId, parsed.data.itemId);

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);

  return {
    success: true,
    message: "Task completed.",
    projectId: parsed.data.projectId,
  };
}

export async function addMilestoneAction(
  projectId: string,
  values: MilestoneFormValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const idParsed = projectIdActionSchema.safeParse({ projectId });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = milestoneFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add a milestone title, description, and due date.",
    };
  }

  const project = await addProjectMilestone(
    idParsed.data.projectId,
    parsed.data,
  );

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${idParsed.data.projectId}`);

  return {
    success: true,
    message: "Milestone added.",
    projectId: idParsed.data.projectId,
  };
}

export async function markMilestoneCompleteAction(
  projectId: string,
  milestoneId: string,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const parsed = projectItemActionSchema.safeParse({
    projectId,
    itemId: milestoneId,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Milestone id is invalid.",
    };
  }

  await markProjectMilestoneComplete(
    parsed.data.projectId,
    parsed.data.itemId,
  );

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);

  return {
    success: true,
    message: "Milestone completed.",
    projectId: parsed.data.projectId,
  };
}

export async function addUpdateAction(
  projectId: string,
  values: UpdateFormValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");

  const idParsed = projectIdActionSchema.safeParse({ projectId });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = updateFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add an update title and message.",
    };
  }

  const project = await addProjectUpdate(idParsed.data.projectId, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${idParsed.data.projectId}`);

  return {
    success: true,
    message: "Project update added.",
    projectId: idParsed.data.projectId,
  };
}

export async function requestProjectApprovalAction(
  projectId: string,
  values: ProjectApprovalRequestValues,
): Promise<ProjectActionResult> {
  const adminProfile = await requireRole("admin");
  const projectIdParsed = uuidSchema.safeParse(projectId);

  if (!projectIdParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = approvalRequestSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add an approval title and description.",
    };
  }

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectIdParsed.data))
    .limit(1);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  if (parsed.data.milestoneId) {
    const [milestone] = await db
      .select({ id: milestones.id })
      .from(milestones)
      .where(
        and(
          eq(milestones.id, parsed.data.milestoneId),
          eq(milestones.projectId, projectIdParsed.data),
        ),
      )
      .limit(1);

    if (!milestone) {
      return {
        success: false,
        message: "Milestone not found.",
      };
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(approvals).values({
      projectId: projectIdParsed.data,
      milestoneId: parsed.data.milestoneId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "pending",
      requestedBy: adminProfile.id,
    });

    if (parsed.data.milestoneId) {
      await tx
        .update(milestones)
        .set({
          status: "waiting_approval",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(milestones.id, parsed.data.milestoneId),
            eq(milestones.projectId, projectIdParsed.data),
          ),
        );
    }
  });

  revalidateProjectWorkflow(projectIdParsed.data);

  return {
    success: true,
    message: "Approval requested.",
    projectId: projectIdParsed.data,
  };
}

export async function addProjectPaymentAction(
  projectId: string,
  values: ProjectPaymentValues,
): Promise<ProjectActionResult> {
  await requireRole("admin");
  const projectIdParsed = uuidSchema.safeParse(projectId);

  if (!projectIdParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  const parsed = paymentRecordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the payment amount, status, and due date.",
    };
  }

  const amountCents = Math.round(parsed.data.amountDollars * 100);

  await db.insert(payments).values({
    projectId: projectIdParsed.data,
    amountCents,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate || null,
    paidAt: parsed.data.status === "paid" ? new Date() : null,
    notes: parsed.data.notes?.trim() || null,
  });

  revalidateProjectWorkflow(projectIdParsed.data);

  return {
    success: true,
    message: "Payment record added.",
    projectId: projectIdParsed.data,
  };
}

export async function updateProjectPaymentStatusAction(input: {
  projectId: string;
  paymentId: string;
  status: "unpaid" | "partial" | "paid" | "overdue";
}): Promise<ProjectActionResult> {
  await requireRole("admin");

  const parsed = paymentStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Payment request is invalid.",
    };
  }

  const [payment] = await db
    .update(payments)
    .set({
      status: parsed.data.status,
      paidAt: parsed.data.status === "paid" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(payments.id, parsed.data.paymentId),
        eq(payments.projectId, parsed.data.projectId),
      ),
    )
    .returning({ id: payments.id });

  if (!payment) {
    return {
      success: false,
      message: "Payment not found.",
    };
  }

  revalidateProjectWorkflow(parsed.data.projectId);

  return {
    success: true,
    message: "Payment status updated.",
    projectId: parsed.data.projectId,
  };
}

export async function uploadProjectFileAction(
  _previousState: ProjectActionResult,
  formData: FormData,
): Promise<ProjectActionResult> {
  const adminProfile = await requireRole("admin");
  const projectIdParsed = uuidSchema.safeParse(formData.get("projectId"));
  const categoryParsed = projectFileCategorySchema.safeParse(
    formData.get("category") || "deliverable",
  );
  const visibleToClient = formData.get("isVisibleToClient") === "on";
  const file = formData.get("file");

  if (!projectIdParsed.success) {
    return {
      success: false,
      message: "Project id is invalid.",
    };
  }

  if (!categoryParsed.success) {
    return {
      success: false,
      message: "File category is invalid.",
    };
  }

  if (!(file instanceof File) || file.size <= 0) {
    return {
      success: false,
      message: "Choose a file to upload.",
    };
  }

  const safeFileName = normalizeFileName(file.name);
  const storagePath = `${projectIdParsed.data}/${Date.now()}-${safeFileName}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from("project-files")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      message: "File could not be uploaded. Check Supabase Storage settings.",
    };
  }

  await db.insert(projectFiles).values({
    projectId: projectIdParsed.data,
    uploadedBy: adminProfile.id,
    fileName: file.name,
    bucketName: "project-files",
    storagePath,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    category: categoryParsed.data,
    isVisibleToClient: visibleToClient,
  });

  revalidateProjectWorkflow(projectIdParsed.data);

  return {
    success: true,
    message: "File uploaded.",
    projectId: projectIdParsed.data,
  };
}
