"use server";

import { revalidatePath } from "next/cache";

import {
  archiveAdminClient,
  createAdminClient,
  deleteAdminClient,
  updateAdminClient,
} from "@/features/admin/clients/clients-data";
import {
  clientIdActionSchema,
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

  try {
    const client = await createAdminClient(parsed.data);

    revalidatePath("/admin/clients");

    return {
      success: true,
      message: "Client added.",
      clientId: client.id,
    };
  } catch {
    return {
      success: false,
      message: "Client could not be added.",
    };
  }
}

export async function updateClientAction(
  id: string,
  values: ClientFormValues,
): Promise<ClientActionResult> {
  await requireRole("admin");

  const idParsed = clientIdActionSchema.safeParse({ clientId: id });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Client id is invalid.",
    };
  }

  const parsed = clientFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the form fields.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  try {
    const client = await updateAdminClient(idParsed.data.clientId, parsed.data);

    if (!client) {
      return {
        success: false,
        message: "Client not found.",
      };
    }

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${idParsed.data.clientId}`);

    return {
      success: true,
      message: "Client saved.",
      clientId: client.id,
    };
  } catch {
    return {
      success: false,
      message: "Client could not be saved.",
    };
  }
}

export async function archiveClientAction(
  id: string,
): Promise<ClientActionResult> {
  await requireRole("admin");

  const idParsed = clientIdActionSchema.safeParse({ clientId: id });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Client id is invalid.",
    };
  }

  const client = await archiveAdminClient(idParsed.data.clientId);

  if (!client) {
    return {
      success: false,
      message: "Client not found.",
    };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${idParsed.data.clientId}`);
  revalidatePath("/client/overview");
  revalidatePath("/client/project");

  return {
    success: true,
    message: "Client archived.",
    clientId: client.id,
  };
}

export async function deleteClientAction(
  id: string,
): Promise<ClientActionResult> {
  await requireRole("admin");

  const idParsed = clientIdActionSchema.safeParse({ clientId: id });
  if (!idParsed.success) {
    return {
      success: false,
      message: "Client id is invalid.",
    };
  }

  const client = await deleteAdminClient(idParsed.data.clientId);

  if (!client) {
    return {
      success: false,
      message: "Client not found.",
    };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${idParsed.data.clientId}`);
  revalidatePath("/client/overview");
  revalidatePath("/client/project");

  return {
    success: true,
    message: "Client deleted.",
    clientId: client.id,
  };
}
