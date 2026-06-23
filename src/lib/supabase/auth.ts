import "server-only";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { clients, profiles } from "@/db/schema";
import {
  getDashboardPathForRole,
  isSupportedRole,
} from "@/lib/supabase/route-protection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

type AuthState =
  | { status: "unauthenticated" }
  | { status: "missing_profile"; userId: string }
  | { status: "missing_client"; userId: string }
  | { status: "invalid_role"; userId: string }
  | { status: "authenticated"; userId: string; profile: Profile };

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function toProfile(row: {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.fullName,
    avatar_url: row.avatarUrl,
    role: row.role,
    created_at: toIsoString(row.createdAt),
    updated_at: toIsoString(row.updatedAt),
  };
}

function redirectToLogin(
  error?: "profile_missing" | "client_missing" | "role_invalid",
): never {
  if (!error) {
    redirect(routes.auth.login);
  }

  redirect(`${routes.auth.login}?error=${error}`);
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export const getAuthState = cache(async (): Promise<AuthState> => {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "unauthenticated",
    };
  }

  const [profileRow] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      role: profiles.role,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profileRow) {
    return {
      status: "missing_profile",
      userId: user.id,
    };
  }

  if (!isSupportedRole(profileRow.role)) {
    return {
      status: "invalid_role",
      userId: user.id,
    };
  }

  if (profileRow.role === "client") {
    const [clientRow] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.profileId, user.id), eq(clients.status, "active")))
      .limit(1);

    if (!clientRow) {
      return {
        status: "missing_client",
        userId: user.id,
      };
    }
  }

  return {
    status: "authenticated",
    userId: user.id,
    profile: toProfile(profileRow),
  };
});

export async function getCurrentProfile(): Promise<Profile | null> {
  const authState = await getAuthState();

  if (authState.status !== "authenticated") {
    return null;
  }

  return authState.profile;
}

export async function requireCurrentProfile(): Promise<Profile> {
  const authState = await getAuthState();

  if (authState.status === "unauthenticated") {
    redirectToLogin();
  }

  if (authState.status === "missing_profile") {
    redirectToLogin("profile_missing");
  }

  if (authState.status === "missing_client") {
    redirectToLogin("client_missing");
  }

  if (authState.status === "invalid_role") {
    redirectToLogin("role_invalid");
  }

  return authState.profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireCurrentProfile();

  if (profile.role !== role) {
    redirect(getDashboardPathForRole(profile.role));
  }

  return profile;
}

export async function redirectIfAuthenticated() {
  const authState = await getAuthState();

  if (authState.status === "authenticated") {
    redirect(getDashboardPathForRole(authState.profile.role));
  }
}
