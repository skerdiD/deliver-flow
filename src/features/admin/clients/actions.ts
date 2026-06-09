"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminClient,
  updateAdminClient,
} from "@/features/admin/clients/clients-data";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/features/admin/clients/client-validation";
import { requireRole } from "@/lib/supabase/auth";

export type ClientActionResult = {
  success: boolean;
  message: string;
  clientId?: string;
  fieldErrors?: Partial<Record<keyof ClientFormValues, string>>;
};

function getFieldErrors(error: unknown): ClientActionResult["fieldErrors"] {
  const result = clientFormSchema.safeParse({});

  if (result.success) {
    return {};
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "flatten" in error &&
    typeof error.flatten === "function"
  ) {
    const flattened = error.flatten();

    return {
      name: flattened.fieldErrors.name?.[0],
      email: flattened.fieldErrors.email?.[0],
      company: flattened.fieldErrors.company?.[0],
      status: flattened.fieldErrors.status?.[0],
    };
  }

  return {};
}

export async function createClientAction(
  values: ClientFormValues,
): Promise<ClientActionResult> {
  await requireRole("admin");

  const parsed = clientFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the form fields.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const client = await createAdminClient(parsed.data);

  revalidatePath("/admin/clients");

  return {
    success: true,
    message: "Client added.",
    clientId: client.id,
  };
}

export async function updateClientAction(
  id: string,
  values: ClientFormValues,
): Promise<ClientActionResult> {
  await requireRole("admin");

  const parsed = clientFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the form fields.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const client = await updateAdminClient(id, parsed.data);

  if (!client) {
    return {
      success: false,
      message: "Client not found.",
    };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);

  return {
    success: true,
    message: "Client saved.",
    clientId: client.id,
  };
}
