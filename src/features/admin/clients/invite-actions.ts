"use server";

import { revalidatePath } from "next/cache";

import {
  createClientInvite,
  type CreatedClientInvite,
} from "@/features/admin/clients/invite-data";
import {
  inviteClientSchema,
  type InviteClientValues,
} from "@/features/admin/clients/invite-validation";
import { requireRole } from "@/lib/supabase/auth";

export type InviteClientActionResult = {
  success: boolean;
  message: string;
  invite?: CreatedClientInvite;
  fieldErrors?: Partial<Record<keyof InviteClientValues, string>>;
};

export async function inviteClientAction(
  values: InviteClientValues,
): Promise<InviteClientActionResult> {
  const adminProfile = await requireRole("admin");
  const parsed = inviteClientSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Please check the invite fields.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        name: fieldErrors.name?.[0],
        company: fieldErrors.company?.[0],
        expiresInDays: fieldErrors.expiresInDays?.[0],
      },
    };
  }

  try {
    const invite = await createClientInvite(parsed.data, adminProfile);

    revalidatePath("/admin/clients");

    return {
      success: true,
      message: invite.emailSent
        ? "Invite sent."
        : "Invite created. Copy the secure link and send it to the client.",
      invite,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invite could not be created.",
    };
  }
}
