import "server-only";

import { and, desc, eq, gt, lte } from "drizzle-orm";

import { db } from "@/db";
import { clientInvitations, clients } from "@/db/schema";
import { createInviteToken, hashInviteToken } from "@/features/invitations/token";
import { routes } from "@/config/routes";
import { getAppBaseUrl } from "@/lib/app-url";
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

  const [pendingInvite] = await db
    .select({ id: clientInvitations.id })
    .from(clientInvitations)
    .where(
      and(
        eq(clientInvitations.email, email),
        eq(clientInvitations.status, "pending"),
        gt(clientInvitations.expiresAt, now),
      ),
    )
    .limit(1);

  if (pendingInvite) {
    throw new Error(
      "A pending invite already exists for this email. Wait for it to expire before creating another.",
    );
  }

  const [existingClient] = await db
    .select({
      id: clients.id,
      profileId: clients.profileId,
      status: clients.status,
    })
    .from(clients)
    .where(eq(clients.email, email))
    .limit(1);

  if (existingClient?.profileId) {
    throw new Error(
      "This client already has portal access. Update the client instead of sending a new invite.",
    );
  }

  const clientId = await db.transaction(async (tx) => {
    const preparedClientId =
      existingClient?.id ??
      (
        await tx
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

    if (!preparedClientId) {
      throw new Error("Client record could not be prepared.");
    }

    if (existingClient) {
      await tx
        .update(clients)
        .set({
          contactName: input.name,
          companyName: input.company?.trim() || "Independent client",
          status: "inactive",
          updatedAt: now,
        })
        .where(eq(clients.id, preparedClientId));
    }

    await tx
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

    await tx.insert(clientInvitations).values({
      email,
      clientId: preparedClientId,
      tokenHash,
      status: "pending",
      invitedBy: inviter.id,
      expiresAt,
    });

    return {
      id: preparedClientId,
      token,
    };
  });

  const inviteLink = `${await getAppBaseUrl()}${routes.invite.accept(clientId.token)}`;

  return {
    inviteLink,
    emailSent: false,
    emailDeliveryError:
      "Automatic invite email is not configured. Copy this secure link and send it to the client.",
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
