"use server";

import { revalidatePath } from "next/cache";

import {
  addClientFeedback,
  respondToClientApproval,
} from "@/features/client/portal/portal-data";
import {
  clientApprovalResponseSchema,
  clientFeedbackSchema,
  type ClientApprovalResponseValues,
  type ClientFeedbackValues,
} from "@/features/client/portal/portal-validation";

export type ClientPortalActionResult = {
  success: boolean;
  message: string;
};

export async function sendClientFeedbackAction(
  values: ClientFeedbackValues,
): Promise<ClientPortalActionResult> {
  const parsed = clientFeedbackSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please write a short feedback message first.",
    };
  }

  await addClientFeedback(parsed.data.message);

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");
  revalidatePath("/client/feedback");

  return {
    success: true,
    message: "Feedback sent.",
  };
}

export async function approveMilestoneAction(
  values: ClientApprovalResponseValues,
): Promise<ClientPortalActionResult> {
  const parsed = clientApprovalResponseSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your approval note.",
    };
  }

  await respondToClientApproval({
    status: "approved",
    responseNote: parsed.data.responseNote || "Approved by client.",
  });

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");

  return {
    success: true,
    message: "Milestone approved.",
  };
}

export async function requestChangesAction(
  values: ClientApprovalResponseValues,
): Promise<ClientPortalActionResult> {
  const parsed = clientApprovalResponseSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your change request.",
    };
  }

  await respondToClientApproval({
    status: "changes_requested",
    responseNote:
      parsed.data.responseNote || "Client requested changes before approval.",
  });

  revalidatePath("/client/dashboard");
  revalidatePath("/client/project");

  return {
    success: true,
    message: "Change request sent.",
  };
}