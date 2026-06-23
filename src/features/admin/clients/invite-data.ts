import "server-only";

import { and, desc, eq, lte } from "drizzle-orm";

import { db } from "@/db";
import { clientInvitations, clients } from "@/db/schema";
import { createInviteToken, hashInviteToken } from "@/features/invitations/token";
import { routes } from "@/config/routes";
import { getAppBaseUrl } from "@/lib/app-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";

export type AdminClientInvite = {
  id: string;
  email: string;
  clientName: string;
  companyName: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type CreatedClientInvite = {
  inviteLink: string;
  emailSent: boolean;
  emailDeliveryError?: string;
};

type CreateClientInviteInput = {
  email: string;
  name: string;
  company?: string;
  expiresInDays: number;
};

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getAdminClientInvites(): Promise<AdminClientInvite[]> {
  await expirePendingClientInvites();

  const rows = await db
    .select({
      id: clientInvitations.id,
      email: clientInvitations.email,
      status: clientInvitations.status,
      expiresAt: clientInvitations.expiresAt,
      acceptedAt: clientInvitations.acceptedAt,
      createdAt: clientInvitations.createdAt,
      clientName: clients.contactName,
      companyName: clients.companyName,
    })
    .from(clientInvitations)
    .leftJoin(clients, eq(clientInvitations.clientId, clients.id))
    .orderBy(desc(clientInvitations.createdAt))
    .limit(25);

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    clientName: row.clientName ?? "Invited client",
    companyName: row.companyName ?? "Independent client",
    status: row.status,
    expiresAt: toIsoString(row.expiresAt),
    acceptedAt: row.acceptedAt ? toIsoString(row.acceptedAt) : null,
    createdAt: toIsoString(row.createdAt),
  }));
}

export async function createClientInvite(
  input: CreateClientInviteInput,
  inviter: Profile,
): Promise<CreatedClientInvite> {
  const email = normalizeEmail(input.email);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + input.expiresInDays * 24 * 60 * 60 * 1000,
  );

  await expirePendingClientInvites();

  const [existingClient] = await db
    .select({
      id: clients.id,
      profileId: clients.profileId,
      status: clients.status,
    })
    .from(clients)
    .where(eq(clients.email, email))
    .limit(1);

  if (existingClient?.profileId && existingClient.status === "active") {
    throw new Error("Client already has active portal access.");
  }

  const clientId =
    existingClient?.id ??
    (
      await db
        .insert(clients)
        .values({
          email,
          contactName: input.name,
          companyName: input.company?.trim() || "Independent client",
          status: "inactive",
          createdBy: inviter.id,
        })
        .returning({ id: clients.id })
    )[0]?.id;

  if (!clientId) {
    throw new Error("Client record could not be prepared.");
  }

  if (existingClient) {
    await db
      .update(clients)
      .set({
        contactName: input.name,
        companyName: input.company?.trim() || "Independent client",
        status: "inactive",
        updatedAt: now,
      })
      .where(eq(clients.id, clientId));
  }

  await db
    .update(clientInvitations)
    .set({
      status: "expired",
      updatedAt: now,
    })
    .where(
      and(
        eq(clientInvitations.email, email),
        eq(clientInvitations.status, "pending"),
      ),
    );

  const token = createInviteToken();
  const tokenHash = hashInviteToken(token);

  await db.insert(clientInvitations).values({
    email,
    clientId,
    tokenHash,
    status: "pending",
    invitedBy: inviter.id,
    expiresAt,
  });

  const inviteLink = `${await getAppBaseUrl()}${routes.invite.accept(token)}`;
  const emailDeliveryError = await sendSupabaseInviteEmail(email, inviteLink);

  return {
    inviteLink,
    emailSent: !emailDeliveryError,
    emailDeliveryError,
  };
}

async function expirePendingClientInvites() {
  await db
    .update(clientInvitations)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(clientInvitations.status, "pending"),
        lte(clientInvitations.expiresAt, new Date()),
      ),
    );
}

async function sendSupabaseInviteEmail(email: string, inviteLink: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteLink,
      data: {
        invited_via: "deliverflow",
      },
    });

    return error?.message;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return "Invite email could not be sent.";
  }
}
