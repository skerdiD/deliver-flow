"use server";

import { revalidatePath } from "next/cache";

import {
  acceptClientInvite,
  acceptClientInviteWithPassword,
} from "@/features/invitations/invite-data";
import {
  acceptInviteSchema,
  acceptSignedInInviteSchema,
} from "@/features/invitations/validation";

export type AcceptInviteActionState = {
  success: boolean;
  message: string;
  email?: string;
  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
};

export async function acceptInviteAction(
  _previousState: AcceptInviteActionState,
  formData: FormData,
): Promise<AcceptInviteActionState> {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Please check the account setup fields.",
      fieldErrors: {
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const result = await acceptClientInviteWithPassword({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (result.success) {
    revalidatePath("/client/overview");
    revalidatePath("/admin/clients");
  }

  return result;
}

export async function acceptSignedInInviteAction(
  _previousState: AcceptInviteActionState,
  formData: FormData,
): Promise<AcceptInviteActionState> {
  const parsed = acceptSignedInInviteSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invite link is invalid.",
    };
  }

  const result = await acceptClientInvite(parsed.data.token);

  if (result.success) {
    revalidatePath("/client/overview");
    revalidatePath("/admin/clients");
  }

  return result;
}
