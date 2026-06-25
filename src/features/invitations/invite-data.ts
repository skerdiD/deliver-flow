import "server-only";

import { and, eq, isNull, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { clientInvitations, clients, profiles } from "@/db/schema";
import { hashInviteToken } from "@/features/invitations/token";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  email?: string;
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
      success: false,
      message: "This invite has already been used.",
    };
  }

  if (invite.status === "expired" || new Date(invite.expiresAt) <= new Date()) {
    await markInviteExpired(invite.id);

    return {
      success: false,
      message: "This invite has expired. Ask your project owner for a new one.",
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

  const invitedClient = invite.clientId
    ? (
        await db
          .select({
            id: clients.id,
            email: clients.email,
            contactName: clients.contactName,
            profileId: clients.profileId,
          })
          .from(clients)
          .where(eq(clients.id, invite.clientId))
          .limit(1)
      )[0]
    : null;

  if (invite.clientId && !invitedClient) {
    return {
      success: false,
      message: "Invite is no longer connected to a valid client record.",
    };
  }

  if (invitedClient && normalizeEmail(invitedClient.email) !== invite.email) {
    return {
      success: false,
      message: "Invite is no longer connected to a valid client record.",
    };
  }

  if (invitedClient?.profileId && invitedClient.profileId !== user.id) {
    return {
      success: false,
      message: "This client already has portal access. Sign in instead.",
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

  const accepted = await db.transaction(async (tx) => {
    await tx
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

    const [updatedClient] = await tx
      .update(clients)
      .set({
        profileId: user.id,
        status: "active",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.email, invite.email),
          or(isNull(clients.profileId), eq(clients.profileId, user.id)),
        ),
      )
      .returning({ id: clients.id });

    if (!updatedClient) {
      return false;
    }

    const [acceptedInvite] = await tx
      .update(clientInvitations)
      .set({
        status: "accepted",
        acceptedBy: user.id,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clientInvitations.id, invite.id),
          eq(clientInvitations.status, "pending"),
        ),
      )
      .returning({ id: clientInvitations.id });

    return Boolean(acceptedInvite);
  });

  if (!accepted) {
    return {
      success: false,
      message: "This invite could not be accepted. Ask your project owner for a new invite.",
    };
  }

  return {
    success: true,
    message: "Your account is ready. You can now open your portal.",
    email: userEmail,
  };
}

export async function acceptClientInviteWithPassword(input: {
  token: string;
  password: string;
}): Promise<AcceptInviteResult> {
  const invite = await getInviteByToken(input.token);

  if (!invite) {
    return {
      success: false,
      message: "Invite link is invalid.",
    };
  }

  if (invite.status === "accepted") {
    return {
      success: false,
      message: "This invite has already been used.",
    };
  }

  if (invite.status === "expired" || new Date(invite.expiresAt) <= new Date()) {
    await markInviteExpired(invite.id);

    return {
      success: false,
      message: "This invite has expired. Ask your project owner for a new one.",
    };
  }

  if (!invite.clientId) {
    return {
      success: false,
      message: "Invite is missing its client record. Ask your project owner for a new invite.",
    };
  }

  const [invitedClient] = await db
    .select({
      id: clients.id,
      email: clients.email,
      contactName: clients.contactName,
      profileId: clients.profileId,
    })
    .from(clients)
    .where(eq(clients.id, invite.clientId))
    .limit(1);

  if (!invitedClient || normalizeEmail(invitedClient.email) !== invite.email) {
    return {
      success: false,
      message: "Invite is no longer connected to a valid client record.",
    };
  }

  if (invitedClient.profileId) {
    return {
      success: false,
      message: "This client already has portal access. Sign in instead.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: invite.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: invitedClient.contactName,
      invited_via: "deliverflow",
    },
  });

  if (error || !data.user) {
    return {
      success: false,
      message:
        "We could not create this account. If you already have an account, sign in with the invited email and reopen the invite.",
    };
  }

  const userId = data.user.id;

  try {
    await db.transaction(async (tx) => {
      const [existingProfileById] = await tx
        .select({ id: profiles.id, role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      if (existingProfileById) {
        throw new Error("profile_exists");
      }

      const [existingProfileByEmail] = await tx
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.email, invite.email))
        .limit(1);

      if (existingProfileByEmail) {
        throw new Error("profile_exists");
      }

      await tx.insert(profiles).values({
        id: userId,
        email: invite.email,
        fullName: invitedClient.contactName,
        avatarUrl: null,
        role: "client",
      });

      const [updatedClient] = await tx
        .update(clients)
        .set({
          profileId: userId,
          status: "active",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(clients.id, invitedClient.id),
            eq(clients.email, invite.email),
            or(isNull(clients.profileId), eq(clients.profileId, userId)),
          ),
        )
        .returning({ id: clients.id });

      if (!updatedClient) {
        throw new Error("client_link_failed");
      }

      const [acceptedInvite] = await tx
        .update(clientInvitations)
        .set({
          status: "accepted",
          acceptedBy: userId,
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(clientInvitations.id, invite.id),
            eq(clientInvitations.status, "pending"),
          ),
        )
        .returning({ id: clientInvitations.id });

      if (!acceptedInvite) {
        throw new Error("invite_not_pending");
      }
    });
  } catch {
    await supabase.auth.admin.deleteUser(userId);

    return {
      success: false,
      message:
        "We could not finish setting up this account. Please ask your project owner for a new invite.",
    };
  }

  return {
    success: true,
    message: "Your account is ready. You can now open your portal.",
    email: invite.email,
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
