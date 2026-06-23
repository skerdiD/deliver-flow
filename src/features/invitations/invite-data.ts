import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { clientInvitations, clients, profiles } from "@/db/schema";
import { hashInviteToken } from "@/features/invitations/token";
import { getCurrentUser } from "@/lib/supabase/auth";

export type InvitePreview =
  | { status: "invalid" }
  | { status: "expired"; email: string }
  | { status: "accepted"; email: string }
  | {
      status: "pending";
      email: string;
      expiresAt: string;
      authenticatedEmail: string | null;
      emailMatches: boolean;
    };

export type AcceptInviteResult = {
  success: boolean;
  message: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

export async function getInvitePreview(token: string): Promise<InvitePreview> {
  const invite = await getInviteByToken(token);

  if (!invite) {
    return { status: "invalid" };
  }

  const now = new Date();

  if (invite.status === "accepted") {
    return {
      status: "accepted",
      email: invite.email,
    };
  }

  if (invite.status === "expired" || new Date(invite.expiresAt) <= now) {
    await markInviteExpired(invite.id);

    return {
      status: "expired",
      email: invite.email,
    };
  }

  const user = await getCurrentUser();
  const authenticatedEmail = user?.email ? normalizeEmail(user.email) : null;

  return {
    status: "pending",
    email: invite.email,
    expiresAt: toIsoString(invite.expiresAt),
    authenticatedEmail,
    emailMatches: authenticatedEmail === invite.email,
  };
}

export async function acceptClientInvite(
  token: string,
): Promise<AcceptInviteResult> {
  const user = await getCurrentUser();

  if (!user?.email) {
    return {
      success: false,
      message: "Sign in with the invited email before accepting this invite.",
    };
  }

  const invite = await getInviteByToken(token);

  if (!invite) {
    return {
      success: false,
      message: "Invite link is invalid.",
    };
  }

  if (invite.status === "accepted") {
    return {
      success: true,
      message: "Invite was already accepted.",
    };
  }

  if (invite.status === "expired" || new Date(invite.expiresAt) <= new Date()) {
    await markInviteExpired(invite.id);

    return {
      success: false,
      message: "Invite link has expired. Ask your project owner for a new one.",
    };
  }

  const userEmail = normalizeEmail(user.email);

  if (userEmail !== invite.email) {
    return {
      success: false,
      message: "This invite belongs to a different email address.",
    };
  }

  const [existingProfileById] = await db
    .select({
      id: profiles.id,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existingProfileById && existingProfileById.role !== "client") {
    return {
      success: false,
      message: "Use a client account to accept this invite.",
    };
  }

  const [existingProfileByEmail] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.email, userEmail), ne(profiles.id, user.id)))
    .limit(1);

  if (existingProfileByEmail) {
    return {
      success: false,
      message: "This email is already connected to another profile.",
    };
  }

  const [clientLinkedToProfile] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      invite.clientId
        ? and(eq(clients.profileId, user.id), ne(clients.id, invite.clientId))
        : eq(clients.profileId, user.id),
    )
    .limit(1);

  if (clientLinkedToProfile) {
    return {
      success: false,
      message: "This account is already connected to another client record.",
    };
  }

  const clientId =
    invite.clientId ??
    (
      await db
        .insert(clients)
        .values({
          email: invite.email,
          contactName:
            user.user_metadata?.full_name?.toString() ?? invite.email,
          companyName: "Independent client",
          status: "inactive",
        })
        .returning({ id: clients.id })
    )[0]?.id;

  if (!clientId) {
    return {
      success: false,
      message: "Client record could not be prepared.",
    };
  }

  await db
    .insert(profiles)
    .values({
      id: user.id,
      email: userEmail,
      fullName: user.user_metadata?.full_name?.toString() ?? null,
      avatarUrl: user.user_metadata?.avatar_url?.toString() ?? null,
      role: "client",
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email: userEmail,
        role: "client",
        updatedAt: new Date(),
      },
    });

  await db
    .update(clients)
    .set({
      profileId: user.id,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId));

  await db
    .update(clientInvitations)
    .set({
      status: "accepted",
      acceptedBy: user.id,
      acceptedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientInvitations.id, invite.id));

  return {
    success: true,
    message: "Invite accepted.",
  };
}

async function getInviteByToken(token: string) {
  const [invite] = await db
    .select({
      id: clientInvitations.id,
      email: clientInvitations.email,
      clientId: clientInvitations.clientId,
      status: clientInvitations.status,
      expiresAt: clientInvitations.expiresAt,
    })
    .from(clientInvitations)
    .where(eq(clientInvitations.tokenHash, hashInviteToken(token)))
    .limit(1);

  return invite
    ? {
        ...invite,
        email: normalizeEmail(invite.email),
      }
    : null;
}

async function markInviteExpired(inviteId: string) {
  await db
    .update(clientInvitations)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(clientInvitations.id, inviteId));
}
