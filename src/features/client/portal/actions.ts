"use server";

import { revalidatePath } from "next/cache";

import {
  addClientFeedback,
  respondToClientApproval,
} from "@/features/client/portal/portal-data";
import {
  clientApprovalActionSchema,
  clientFeedbackSchema,
  type ClientApprovalResponseValues,
  type ClientFeedbackValues,
} from "@/features/client/portal/portal-validation";

export type ClientPortalActionResult = {
  success: boolean;
  message: string;
};

export async function sendClientFeedbackAction(
  projectId: string,
  values: ClientFeedbackValues,
): Promise<ClientPortalActionResult> {
  const parsed = clientFeedbackSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please write a short feedback message first.",
    };
  }

  try {
    await addClientFeedback(projectId, parsed.data.message);
  } catch {
    return {
      success: false,
      message: "You do not have access to this project.",
    };
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath(`/client/project/${projectId}`);
  revalidatePath("/client/feedback");
  revalidatePath(`/client/feedback/${projectId}`);

  return {
    success: true,
    message: "Feedback sent.",
  };
}

export async function approveMilestoneAction(
  projectId: string,
  approvalId: string,
  values: ClientApprovalResponseValues,
): Promise<ClientPortalActionResult> {
  const parsed = clientApprovalActionSchema.safeParse({
    ...values,
    status: "approved",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your approval note.",
    };
  }

  try {
    const approval = await respondToClientApproval({
      projectId,
      approvalId,
      status: parsed.data.status,
      responseNote: parsed.data.responseNote || "Approved by client.",
    });

    if (!approval) {
      return {
        success: false,
        message: "This approval has already been answered.",
      };
    }
  } catch {
    return {
      success: false,
      message: "We could not save your approval. Please try again.",
    };
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath(`/client/project/${projectId}`);

  return {
    success: true,
    message: "Milestone approved.",
  };
}

export async function requestChangesAction(
  projectId: string,
  approvalId: string,
  values: ClientApprovalResponseValues,
): Promise<ClientPortalActionResult> {
  const parsed = clientApprovalActionSchema.safeParse({
    ...values,
    status: "changes_requested",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your change request.",
    };
  }

  if (!parsed.data.responseNote || parsed.data.responseNote.length < 5) {
    return {
      success: false,
      message: "Please add a short note before requesting changes.",
    };
  }

  try {
    const approval = await respondToClientApproval({
      projectId,
      approvalId,
      status: parsed.data.status,
      responseNote: parsed.data.responseNote,
    });

    if (!approval) {
      return {
        success: false,
        message: "This approval has already been answered.",
      };
    }
  } catch {
    return {
      success: false,
      message: "We could not send your change request. Please try again.",
    };
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath(`/client/project/${projectId}`);

  return {
    success: true,
    message: "Change request sent.",
  };
}
