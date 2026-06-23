"use server";

import { revalidatePath } from "next/cache";

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
import { requireRole } from "@/lib/supabase/auth";

export type ProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
};

function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "Client not found.") {
    return error.message;
  }

  return fallback;
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
