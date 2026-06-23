"use server";

import { revalidatePath } from "next/cache";

import { acceptClientInvite } from "@/features/invitations/invite-data";
import { acceptInviteSchema } from "@/features/invitations/validation";

export type AcceptInviteActionState = {
  success: boolean;
  message: string;
};

export async function acceptInviteAction(
  _previousState: AcceptInviteActionState,
  formData: FormData,
): Promise<AcceptInviteActionState> {
  const parsed = acceptInviteSchema.safeParse({
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
    revalidatePath("/client/dashboard");
    revalidatePath("/admin/clients");
  }

  return result;
}
