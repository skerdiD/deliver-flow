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
  projectFormSchema,
  taskFormSchema,
  updateFormSchema,
  type MilestoneFormValues,
  type ProgressFormValues,
  type ProjectFormValues,
  type TaskFormValues,
  type UpdateFormValues,
} from "@/features/admin/projects/project-validation";

export type ProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
};

export async function createProjectAction(
  values: ProjectFormValues,
): Promise<ProjectActionResult> {
  const parsed = projectFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the project form fields.",
    };
  }

  const project = await createAdminProject(parsed.data);

  revalidatePath("/admin/projects");

  return {
    success: true,
    message: "Project created.",
    projectId: project.id,
  };
}

export async function updateProjectAction(
  id: string,
  values: ProjectFormValues,
): Promise<ProjectActionResult> {
  const parsed = projectFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the project form fields.",
    };
  }

  const project = await updateAdminProject(id, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);

  return {
    success: true,
    message: "Project saved.",
    projectId: project.id,
  };
}

export async function updateProjectProgressAction(
  id: string,
  values: ProgressFormValues,
): Promise<ProjectActionResult> {
  const parsed = progressFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Progress must be between 0 and 100.",
    };
  }

  const project = await updateProjectProgress(id, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${id}`);

  return {
    success: true,
    message: "Project progress updated.",
    projectId: id,
  };
}

export async function addTaskAction(
  projectId: string,
  values: TaskFormValues,
): Promise<ProjectActionResult> {
  const parsed = taskFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add a task title, description, and due date.",
    };
  }

  const project = await addProjectTask(projectId, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${projectId}`);

  return {
    success: true,
    message: "Task added.",
    projectId,
  };
}

export async function markTaskCompleteAction(
  projectId: string,
  taskId: string,
) {
  await markProjectTaskComplete(projectId, taskId);

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function addMilestoneAction(
  projectId: string,
  values: MilestoneFormValues,
): Promise<ProjectActionResult> {
  const parsed = milestoneFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add a milestone title, description, and due date.",
    };
  }

  const project = await addProjectMilestone(projectId, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${projectId}`);

  return {
    success: true,
    message: "Milestone added.",
    projectId,
  };
}

export async function markMilestoneCompleteAction(
  projectId: string,
  milestoneId: string,
) {
  await markProjectMilestoneComplete(projectId, milestoneId);

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function addUpdateAction(
  projectId: string,
  values: UpdateFormValues,
): Promise<ProjectActionResult> {
  const parsed = updateFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please add an update title and message.",
    };
  }

  const project = await addProjectUpdate(projectId, parsed.data);

  if (!project) {
    return {
      success: false,
      message: "Project not found.",
    };
  }

  revalidatePath(`/admin/projects/${projectId}`);

  return {
    success: true,
    message: "Project update added.",
    projectId,
  };
}