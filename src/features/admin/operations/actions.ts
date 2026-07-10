"use server";

import { and, eq, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/config/routes";
import { db } from "@/db";
import {
  approvals,
  feedback,
  payments,
  projectFiles,
  projects,
  tasks,
  workspaces,
} from "@/db/schema";
import {
  createProjectFileChecksum,
  getProjectFileSecurityConfig,
} from "@/features/projects/file-security.server";
import {
  buildProjectFileStoragePath,
  formatProjectFileSize,
  isManagedProjectFileStoragePath,
  validateProjectFileSelection,
} from "@/features/projects/file-security";
import {
  releaseWorkspaceStorageBytes,
  removeProjectFileStorageObject,
  reserveWorkspaceStorageBytes,
  runInitialProjectFileScan,
} from "@/features/projects/project-files.server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminWorkspace } from "@/lib/supabase/auth";
import { isDemoWorkspaceId } from "@/lib/demo";

export type AdminOperationActionResult = {
  didMutate?: boolean;
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

const respondToFeedbackSchema = z.object({
  feedbackId: z.string().uuid("Feedback id is invalid."),
  adminResponse: z
    .string()
    .trim()
    .min(2, "Write a short response first.")
    .max(800, "Response should stay under 800 characters."),
});

const taskIdSchema = z.object({
  taskId: z.string().uuid("Task id is invalid."),
});

const taskUpdateSchema = taskIdSchema.extend({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(1200),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
});

const fileIdSchema = z.object({
  fileId: z.string().uuid("File id is invalid."),
});

const paymentIdSchema = z.object({
  paymentId: z.string().uuid("Payment id is invalid."),
});

const paymentVoidSchema = paymentIdSchema.extend({
  reason: z.string().trim().max(500).optional(),
});

const feedbackIdSchema = z.object({
  feedbackId: z.string().uuid("Feedback id is invalid."),
});

const approvalIdSchema = z.object({
  approvalId: z.string().uuid("Approval id is invalid."),
});

const workspaceNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(80, "Workspace name must be 80 characters or less."),
});

function getDemoDestructiveActionResult(): AdminOperationActionResult {
  return {
    success: false,
    message: "Demo workspace data is protected and can be reset from the seed.",
  };
}

export async function updateWorkspaceNameAction(input: {
  name: string;
}): Promise<AdminOperationActionResult> {
  const parsed = workspaceNameSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Enter a valid workspace name.",
    };
  }

  const { workspaceId } = await requireAdminWorkspace();

  await db
    .update(workspaces)
    .set({
      name: parsed.data.name,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId));

  revalidatePath(routes.admin.settings);
  revalidatePath(routes.admin.workspaceSettings);

  return {
    success: true,
    message: "Workspace name updated.",
  };
}

const approvalCancelSchema = approvalIdSchema.extend({
  reason: z.string().trim().max(500).optional(),
});

const fileRenameSchema = fileIdSchema.extend({
  fileName: z.string().trim().min(1).max(255),
});

const approvalStatusSchema = approvalIdSchema.extend({
  status: z.enum(["approved", "changes_requested"]),
});

function revalidateProjectOperations(projectId: string) {
  revalidatePath(routes.admin.dashboard);
  revalidatePath(routes.admin.milestones);
  revalidatePath(routes.admin.tasks);
  revalidatePath(routes.admin.files);
  revalidatePath(routes.admin.payments);
  revalidatePath(routes.admin.feedback);
  revalidatePath(routes.admin.approvals);
  revalidatePath(routes.admin.projects);
  revalidatePath(`${routes.admin.projects}/${projectId}`);
  revalidatePath(routes.client.dashboard);
  revalidatePath(routes.client.project);
  revalidatePath(`${routes.client.project}/${projectId}`);
  revalidatePath(routes.client.files);
  revalidatePath(routes.client.payments);
  revalidatePath(routes.client.feedback);
}

export async function markAdminTaskCompleteAction(input: {
  taskId: string;
  projectId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

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
          eq(tasks.workspaceId, workspaceId),
          isNull(tasks.deletedAt),
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

export async function deleteTaskAction(input: {
  taskId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = taskIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Task request is invalid.",
    };
  }

  const deletedAt = new Date();
  const [deletedTask] = await db
    .update(tasks)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(tasks.id, parsed.data.taskId),
        eq(tasks.workspaceId, workspaceId),
        isNull(tasks.deletedAt),
      ),
    )
    .returning({ id: tasks.id, projectId: tasks.projectId });

  if (!deletedTask) {
    return {
      success: false,
      message: "Task not found.",
    };
  }

  revalidateProjectOperations(deletedTask.projectId);

  return {
    success: true,
    message: "Task deleted.",
  };
}

export async function updateTaskAction(input: {
  taskId: string;
  title: string;
  description: string;
  dueDate: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  const parsed = taskUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Task details are invalid.",
    };
  }

  const [task] = await db
    .update(tasks)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tasks.id, parsed.data.taskId),
        eq(tasks.workspaceId, workspaceId),
        isNull(tasks.deletedAt),
      ),
    )
    .returning({ id: tasks.id, projectId: tasks.projectId });

  if (!task) {
    return {
      success: false,
      message: "Task not found.",
    };
  }

  revalidateProjectOperations(task.projectId);

  return {
    success: true,
    message: "Task updated.",
  };
}

export async function deleteFileAction(input: {
  fileId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = fileIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "File request is invalid.",
    };
  }

  const [file] = await db
    .select({
      fileSize: projectFiles.fileSize,
      id: projectFiles.id,
      projectId: projectFiles.projectId,
      bucketName: projectFiles.bucketName,
      storagePath: projectFiles.storagePath,
      workspaceId: projectFiles.workspaceId,
    })
    .from(projectFiles)
    .innerJoin(projects, eq(projectFiles.projectId, projects.id))
    .where(
      and(
        eq(projectFiles.id, parsed.data.fileId),
        eq(projectFiles.workspaceId, workspaceId),
        isNull(projectFiles.deletedAt),
        eq(projects.workspaceId, workspaceId),
        ne(projects.status, "archived"),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!file) {
    return {
      success: false,
      message: "File not found.",
    };
  }

  if (
    !isManagedProjectFileStoragePath({
      projectId: file.projectId,
      storagePath: file.storagePath,
      workspaceId: file.workspaceId,
    })
  ) {
    return {
      success: false,
      message: "File storage record is invalid.",
    };
  }

  const deletedAt = new Date();
  await db
    .update(projectFiles)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(projectFiles.id, file.id),
        eq(projectFiles.workspaceId, workspaceId),
      ),
    );

  await releaseWorkspaceStorageBytes({
    releasedBytes: file.fileSize ?? 0,
    workspaceId,
  });

  const cleanupOutcome = await removeProjectFileStorageObject({
    bucketName: file.bucketName,
    fileId: file.id,
    projectId: file.projectId,
    reason: "delete_failed",
    storagePath: file.storagePath,
    workspaceId,
  });

  revalidateProjectOperations(file.projectId);

  return {
    didMutate: cleanupOutcome.cleanupQueued,
    success: !cleanupOutcome.cleanupQueued,
    message: cleanupOutcome.cleanupQueued
      ? "File removed from records. Storage cleanup was queued."
      : "File deleted.",
  };
}

export async function replaceFileAction(
  formData: FormData,
): Promise<AdminOperationActionResult> {
  const { profile, workspaceId } = await requireAdminWorkspace();
  const securityConfig = getProjectFileSecurityConfig();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = fileIdSchema.safeParse({
    fileId: formData.get("fileId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "File request is invalid.",
    };
  }

  const nextFile = formData.get("file");

  if (!(nextFile instanceof File) || nextFile.size <= 0) {
    return {
      success: false,
      message: "Choose a replacement file.",
    };
  }

  const [existingFile] = await db
    .select({
      bucketName: projectFiles.bucketName,
      fileName: projectFiles.fileName,
      fileSize: projectFiles.fileSize,
      id: projectFiles.id,
      projectId: projectFiles.projectId,
      storagePath: projectFiles.storagePath,
      workspaceId: projectFiles.workspaceId,
    })
    .from(projectFiles)
    .innerJoin(projects, eq(projectFiles.projectId, projects.id))
    .where(
      and(
        eq(projectFiles.id, parsed.data.fileId),
        eq(projectFiles.workspaceId, workspaceId),
        isNull(projectFiles.deletedAt),
        eq(projects.workspaceId, workspaceId),
        ne(projects.status, "archived"),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!existingFile) {
    return {
      success: false,
      message: "File not found.",
    };
  }

  if (
    !isManagedProjectFileStoragePath({
      projectId: existingFile.projectId,
      storagePath: existingFile.storagePath,
      workspaceId: existingFile.workspaceId,
    })
  ) {
    return {
      success: false,
      message: "File storage record is invalid.",
    };
  }

  const nextFileBytes = await nextFile.arrayBuffer();
  const validation = validateProjectFileSelection({
    bytes: nextFileBytes,
    declaredMimeType: nextFile.type,
    displayLabel:
      typeof formData.get("label") === "string"
        ? formData.get("label")?.toString()
        : existingFile.fileName,
    maxUploadBytes: securityConfig.maxUploadBytes,
    originalFileName: nextFile.name,
    sizeBytes: nextFileBytes.byteLength,
  });

  if (!validation.ok) {
    return {
      success: false,
      message: validation.message,
    };
  }

  const storageIncreaseBytes = Math.max(
    nextFileBytes.byteLength - (existingFile.fileSize ?? 0),
    0,
  );
  const storageDecreaseBytes = Math.max(
    (existingFile.fileSize ?? 0) - nextFileBytes.byteLength,
    0,
  );

  const storageReservation = await reserveWorkspaceStorageBytes({
    additionalBytes: storageIncreaseBytes,
    workspaceId,
  });

  if (!storageReservation.allowed) {
    return {
      success: false,
      message: `Workspace storage quota exceeded. ${formatProjectFileSize(
        securityConfig.workspaceQuotaBytes,
      )} total storage is allowed for each workspace.`,
    };
  }

  const nextStoragePath = buildProjectFileStoragePath({
    extension: validation.value.extension,
    objectId: crypto.randomUUID(),
    projectId: existingFile.projectId,
    workspaceId,
  });
  const checksumSha256 = await createProjectFileChecksum(nextFileBytes);
  const supabase = createSupabaseAdminClient();
  const uploadResult = await supabase.storage
    .from(existingFile.bucketName)
    .upload(nextStoragePath, nextFileBytes, {
      contentType: validation.value.validatedMimeType,
      upsert: false,
    });

  if (uploadResult.error) {
    await releaseWorkspaceStorageBytes({
      releasedBytes: storageIncreaseBytes,
      workspaceId,
    });

    return {
      success: false,
      message: "Replacement file could not be uploaded.",
    };
  }

  try {
    const [updatedFile] = await db
      .update(projectFiles)
      .set({
        bucketName: existingFile.bucketName,
        checksumSha256,
        fileExtension: validation.value.extension,
        fileName: validation.value.displayFileName,
        fileSize: nextFileBytes.byteLength,
        fileType: validation.value.validatedMimeType,
        originalFileName: validation.value.originalFileName,
        scanCompletedAt: null,
        scanFailureReason: null,
        scanStatus: "pending",
        storagePath: nextStoragePath,
        updatedAt: new Date(),
        uploadedBy: profile.id,
      })
      .where(
        and(
          eq(projectFiles.id, existingFile.id),
          eq(projectFiles.workspaceId, workspaceId),
          isNull(projectFiles.deletedAt),
        ),
      )
      .returning({
        id: projectFiles.id,
        projectId: projectFiles.projectId,
      });

    if (!updatedFile) {
      throw new Error("File record was not updated.");
    }

    if (storageDecreaseBytes > 0) {
      await releaseWorkspaceStorageBytes({
        releasedBytes: storageDecreaseBytes,
        workspaceId,
      });
    }

    await runInitialProjectFileScan({
      fileId: updatedFile.id,
      projectId: updatedFile.projectId,
      workspaceId,
    });
  } catch {
    await releaseWorkspaceStorageBytes({
      releasedBytes: storageIncreaseBytes,
      workspaceId,
    });

    await removeProjectFileStorageObject({
      bucketName: existingFile.bucketName,
      fileId: existingFile.id,
      projectId: existingFile.projectId,
      reason: "upload_db_failed",
      storagePath: nextStoragePath,
      workspaceId,
    });

    return {
      success: false,
      message:
        "Replacement could not be saved. The existing file is still active.",
    };
  }

  const cleanupOutcome = await removeProjectFileStorageObject({
    bucketName: existingFile.bucketName,
    fileId: existingFile.id,
    projectId: existingFile.projectId,
    reason: "replacement_old_object",
    storagePath: existingFile.storagePath,
    workspaceId,
  });

  revalidateProjectOperations(existingFile.projectId);

  return {
    didMutate: cleanupOutcome.cleanupQueued,
    success: !cleanupOutcome.cleanupQueued,
    message: cleanupOutcome.cleanupQueued
      ? "File replaced. Cleanup of the previous storage object was queued."
      : "File replaced.",
  };
}

export async function renameFileAction(input: {
  fileId: string;
  fileName: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  const parsed = fileRenameSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "File name is invalid.",
    };
  }

  const [file] = await db
    .update(projectFiles)
    .set({
      fileName: parsed.data.fileName,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projectFiles.id, parsed.data.fileId),
        eq(projectFiles.workspaceId, workspaceId),
        isNull(projectFiles.deletedAt),
      ),
    )
    .returning({ id: projectFiles.id, projectId: projectFiles.projectId });

  if (!file) {
    return {
      success: false,
      message: "File not found.",
    };
  }

  revalidateProjectOperations(file.projectId);

  return {
    success: true,
    message: "File renamed.",
  };
}

export async function voidPaymentAction(input: {
  paymentId: string;
  reason?: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = paymentVoidSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Payment request is invalid.",
    };
  }

  const voidedAt = new Date();
  const [payment] = await db
    .update(payments)
    .set({
      status: "void",
      voidedAt,
      voidReason: parsed.data.reason?.trim() || null,
      updatedAt: voidedAt,
    })
    .where(
      and(
        eq(payments.id, parsed.data.paymentId),
        eq(payments.workspaceId, workspaceId),
        isNull(payments.deletedAt),
      ),
    )
    .returning({ id: payments.id, projectId: payments.projectId });

  if (!payment) {
    return {
      success: false,
      message: "Payment not found.",
    };
  }

  revalidateProjectOperations(payment.projectId);

  return {
    success: true,
    message: "Payment voided.",
  };
}

export async function deletePaymentAction(input: {
  paymentId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = paymentIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Payment request is invalid.",
    };
  }

  const deletedAt = new Date();
  const [payment] = await db
    .update(payments)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(payments.id, parsed.data.paymentId),
        eq(payments.workspaceId, workspaceId),
        isNull(payments.deletedAt),
      ),
    )
    .returning({ id: payments.id, projectId: payments.projectId });

  if (!payment) {
    return {
      success: false,
      message: "Payment not found.",
    };
  }

  revalidateProjectOperations(payment.projectId);

  return {
    success: true,
    message: "Payment deleted.",
  };
}

export async function updateAdminFeedbackStatusAction(input: {
  feedbackId: string;
  status: "reviewed" | "resolved";
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

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
        resolvedAt: parsed.data.status === "resolved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(feedback.id, parsed.data.feedbackId),
          eq(feedback.workspaceId, workspaceId),
          isNull(feedback.deletedAt),
        ),
      )
      .returning({ id: feedback.id, projectId: feedback.projectId });

    if (!updatedFeedback) {
      return {
        success: false,
        message: "Feedback not found.",
      };
    }

    revalidateProjectOperations(updatedFeedback.projectId);

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

export async function respondToFeedbackAction(input: {
  feedbackId: string;
  adminResponse: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  const parsed = respondToFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Feedback response is invalid.",
    };
  }

  try {
    const [existingFeedback] = await db
      .select({
        id: feedback.id,
        projectId: feedback.projectId,
        status: feedback.status,
      })
      .from(feedback)
      .where(
        and(
          eq(feedback.id, parsed.data.feedbackId),
          eq(feedback.workspaceId, workspaceId),
          isNull(feedback.deletedAt),
        ),
      )
      .limit(1);

    if (!existingFeedback) {
      return {
        success: false,
        message: "Feedback not found.",
      };
    }

    await db
      .update(feedback)
      .set({
        adminResponse: parsed.data.adminResponse,
        status:
          existingFeedback.status === "resolved" ? "resolved" : "reviewed",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(feedback.id, existingFeedback.id),
          eq(feedback.workspaceId, workspaceId),
        ),
      );

    revalidateProjectOperations(existingFeedback.projectId);

    return {
      success: true,
      message: "Feedback response saved.",
    };
  } catch {
    return {
      success: false,
      message: "Feedback response could not be saved.",
    };
  }
}

export async function archiveFeedbackAction(input: {
  feedbackId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = feedbackIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Feedback request is invalid.",
    };
  }

  const archivedAt = new Date();
  const [archivedFeedback] = await db
    .update(feedback)
    .set({
      archivedAt,
      updatedAt: archivedAt,
    })
    .where(
      and(
        eq(feedback.id, parsed.data.feedbackId),
        eq(feedback.workspaceId, workspaceId),
        isNull(feedback.deletedAt),
      ),
    )
    .returning({ id: feedback.id, projectId: feedback.projectId });

  if (!archivedFeedback) {
    return {
      success: false,
      message: "Feedback not found.",
    };
  }

  revalidateProjectOperations(archivedFeedback.projectId);

  return {
    success: true,
    message: "Feedback archived.",
  };
}

export async function resolveFeedbackAction(input: {
  feedbackId: string;
}): Promise<AdminOperationActionResult> {
  return updateAdminFeedbackStatusAction({
    feedbackId: input.feedbackId,
    status: "resolved",
  });
}

export async function deleteFeedbackAction(input: {
  feedbackId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = feedbackIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Feedback request is invalid.",
    };
  }

  const deletedAt = new Date();
  const [deletedFeedback] = await db
    .update(feedback)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(feedback.id, parsed.data.feedbackId),
        eq(feedback.workspaceId, workspaceId),
        isNull(feedback.deletedAt),
      ),
    )
    .returning({ id: feedback.id, projectId: feedback.projectId });

  if (!deletedFeedback) {
    return {
      success: false,
      message: "Feedback not found.",
    };
  }

  revalidateProjectOperations(deletedFeedback.projectId);

  return {
    success: true,
    message: "Feedback deleted.",
  };
}

export async function cancelApprovalAction(input: {
  approvalId: string;
  reason?: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = approvalCancelSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Approval request is invalid.",
    };
  }

  const cancelledAt = new Date();
  const [approval] = await db
    .update(approvals)
    .set({
      status: "cancelled",
      cancelReason: parsed.data.reason?.trim() || null,
      cancelledAt,
      updatedAt: cancelledAt,
    })
    .where(
      and(
        eq(approvals.id, parsed.data.approvalId),
        eq(approvals.workspaceId, workspaceId),
        isNull(approvals.deletedAt),
      ),
    )
    .returning({ id: approvals.id, projectId: approvals.projectId });

  if (!approval) {
    return {
      success: false,
      message: "Approval not found.",
    };
  }

  revalidateProjectOperations(approval.projectId);

  return {
    success: true,
    message: "Approval cancelled.",
  };
}

export async function updateApprovalStatusAction(input: {
  approvalId: string;
  status: "approved" | "changes_requested";
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  const parsed = approvalStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Approval request is invalid.",
    };
  }

  const respondedAt = new Date();
  const [approval] = await db
    .update(approvals)
    .set({
      status: parsed.data.status,
      respondedAt,
      updatedAt: respondedAt,
    })
    .where(
      and(
        eq(approvals.id, parsed.data.approvalId),
        eq(approvals.workspaceId, workspaceId),
        isNull(approvals.deletedAt),
      ),
    )
    .returning({ id: approvals.id, projectId: approvals.projectId });

  if (!approval) {
    return {
      success: false,
      message: "Approval not found.",
    };
  }

  revalidateProjectOperations(approval.projectId);

  return {
    success: true,
    message:
      parsed.data.status === "approved"
        ? "Approval marked approved."
        : "Approval marked as changes requested.",
  };
}

export async function approveApprovalAction(input: {
  approvalId: string;
}): Promise<AdminOperationActionResult> {
  return updateApprovalStatusAction({
    approvalId: input.approvalId,
    status: "approved",
  });
}

export async function rejectApprovalAction(input: {
  approvalId: string;
}): Promise<AdminOperationActionResult> {
  return updateApprovalStatusAction({
    approvalId: input.approvalId,
    status: "changes_requested",
  });
}

export async function deleteApprovalAction(input: {
  approvalId: string;
}): Promise<AdminOperationActionResult> {
  const { workspaceId } = await requireAdminWorkspace();

  if (isDemoWorkspaceId(workspaceId)) {
    return getDemoDestructiveActionResult();
  }

  const parsed = approvalIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Approval request is invalid.",
    };
  }

  const deletedAt = new Date();
  const [approval] = await db
    .update(approvals)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(approvals.id, parsed.data.approvalId),
        eq(approvals.workspaceId, workspaceId),
        isNull(approvals.deletedAt),
      ),
    )
    .returning({ id: approvals.id, projectId: approvals.projectId });

  if (!approval) {
    return {
      success: false,
      message: "Approval not found.",
    };
  }

  revalidateProjectOperations(approval.projectId);

  return {
    success: true,
    message: "Approval deleted.",
  };
}
