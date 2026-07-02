"use server";

import { revalidatePath } from "next/cache";

import {
  addClientFeedback,
  respondToClientApproval,
} from "@/features/client/portal/portal-data";
import {
  clientApprovalActionSchema,
  clientApprovalChangeRequestSchema,
  clientApprovalIdSchema,
  clientFeedbackSchema,
  clientProjectIdSchema,
  type ClientApprovalResponseValues,
  type ClientFeedbackValues,
} from "@/features/client/portal/portal-validation";
import { logProjectActivity } from "@/features/projects/activity";

export type ClientPortalActionResult = {
  success: boolean;
  message: string;
};

export async function sendClientFeedbackAction(
  projectId: string,
  values: ClientFeedbackValues,
): Promise<ClientPortalActionResult> {
  const projectIdParsed = clientProjectIdSchema.safeParse(projectId);

  if (!projectIdParsed.success) {
    return {
      success: false,
      message: "You do not have access to this project.",
    };
  }

  const parsed = clientFeedbackSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please write a short feedback message first.",
    };
  }

  try {
    await addClientFeedback(projectIdParsed.data, parsed.data.message);
  } catch {
    return {
      success: false,
      message: "You do not have access to this project.",
    };
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath(`/client/project/${projectIdParsed.data}`);
  revalidatePath("/client/feedback");
  revalidatePath(`/client/feedback/${projectIdParsed.data}`);

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
  const projectIdParsed = clientProjectIdSchema.safeParse(projectId);
  const approvalIdParsed = clientApprovalIdSchema.safeParse(approvalId);

  if (!projectIdParsed.success || !approvalIdParsed.success) {
    return {
      success: false,
      message: "Approval request is invalid.",
    };
  }

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
      projectId: projectIdParsed.data,
      approvalId: approvalIdParsed.data,
      status: parsed.data.status,
      responseNote: parsed.data.responseNote || "Approved by client.",
    });

    if (!approval) {
      return {
        success: false,
        message: "This approval has already been answered.",
      };
    }

    await logProjectActivity({
      projectId: projectIdParsed.data,
      actorId: approval.respondedBy,
      actorName: approval.respondedByName,
      actorRole: "client",
      type: "approval_approved",
      message: `Client approved: ${approval.title}.`,
      metadata: {
        approvalId: approval.id,
        approvalTitle: approval.title,
      },
    });
  } catch {
    return {
      success: false,
      message: "We could not save your approval. Please try again.",
    };
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath(`/client/project/${projectIdParsed.data}`);
  revalidatePath("/client/approvals");

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
  const projectIdParsed = clientProjectIdSchema.safeParse(projectId);
  const approvalIdParsed = clientApprovalIdSchema.safeParse(approvalId);

  if (!projectIdParsed.success || !approvalIdParsed.success) {
    return {
      success: false,
      message: "Approval request is invalid.",
    };
  }

  const parsed = clientApprovalChangeRequestSchema.safeParse({
    ...values,
    status: "changes_requested",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your change request.",
    };
  }

  try {
    const approval = await respondToClientApproval({
      projectId: projectIdParsed.data,
      approvalId: approvalIdParsed.data,
      status: parsed.data.status,
      responseNote: parsed.data.responseNote,
    });

    if (!approval) {
      return {
        success: false,
        message: "This approval has already been answered.",
      };
    }

    await logProjectActivity({
      projectId: projectIdParsed.data,
      actorId: approval.respondedBy,
      actorName: approval.respondedByName,
      actorRole: "client",
      type: "changes_requested",
      message: `Client requested changes: ${approval.title}.`,
      metadata: {
        approvalId: approval.id,
        approvalTitle: approval.title,
      },
    });
  } catch {
    return {
      success: false,
      message: "We could not send your change request. Please try again.",
    };
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath(`/client/project/${projectIdParsed.data}`);
  revalidatePath("/client/approvals");

  return {
    success: true,
    message: "Change request sent.",
  };
}
