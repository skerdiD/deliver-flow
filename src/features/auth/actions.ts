"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { profiles, workspaces } from "@/db/schema";
import { signupSchema, type SignupValues } from "@/features/auth/auth-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDashboardPathForRole } from "@/lib/supabase/route-protection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type SignupActionResult =
  | { success: true; email: string }
  | { success: false; message: string };

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect(routes.auth.login);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function slugifyWorkspaceName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "workspace";
}

function getDemoCredential(role: UserRole) {
  const emailKey =
    role === "owner" ? "DEMO_OWNER_EMAIL" : "DEMO_CLIENT_EMAIL";
  const passwordKey =
    role === "owner" ? "DEMO_OWNER_PASSWORD" : "DEMO_CLIENT_PASSWORD";
  const email = process.env[emailKey]?.trim();
  const password = process.env[passwordKey]?.trim();

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

function redirectToDemoError(
  error: "demo_unavailable" | "demo_signin_failed",
): never {
  redirect(`${routes.auth.login}?error=${error}`);
}

export async function demoLoginAction(formData: FormData) {
  const roleValue = formData.get("role");

  if (roleValue !== "owner" && roleValue !== "client") {
    redirectToDemoError("demo_signin_failed");
  }

  const role: UserRole = roleValue;
  const credentials = getDemoCredential(role);

  if (!credentials) {
    redirectToDemoError("demo_unavailable");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(credentials);

  if (error || !user) {
    redirectToDemoError("demo_signin_failed");
  }

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile || profile.role !== role) {
    await supabase.auth.signOut();
    redirectToDemoError("demo_signin_failed");
  }

  redirect(getDashboardPathForRole(profile.role));
}

export async function createOwnerSignupAction(
  values: SignupValues,
): Promise<SignupActionResult> {
  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the signup details and try again.",
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      workspace_name: parsed.data.workspaceName,
      signup_source: "public_owner_signup",
    },
  });

  if (error || !data.user) {
    return {
      success: false,
      message: "We could not create this account. Try signing in instead.",
    };
  }

  const userId = data.user.id;

  try {
    await db.transaction(async (tx) => {
      const [existingProfile] = await tx
        .select({ id: profiles.id, workspaceId: profiles.workspaceId })
        .from(profiles)
        .where(eq(profiles.email, email))
        .limit(1);

      if (existingProfile && existingProfile.id !== userId) {
        throw new Error("profile_email_exists");
      }

      const workspace =
        existingProfile?.workspaceId
          ? (
              await tx
                .update(workspaces)
                .set({
                  name: parsed.data.workspaceName,
                  slug: `${slugifyWorkspaceName(parsed.data.workspaceName)}-${userId.slice(0, 8)}`,
                  updatedAt: new Date(),
                })
                .where(eq(workspaces.id, existingProfile.workspaceId))
                .returning({ id: workspaces.id })
            )[0]
          : (
              await tx
                .insert(workspaces)
                .values({
                  name: parsed.data.workspaceName,
                  slug: `${slugifyWorkspaceName(parsed.data.workspaceName)}-${userId.slice(0, 8)}`,
                })
                .returning({ id: workspaces.id })
            )[0];

      if (!workspace) {
        throw new Error("workspace_create_failed");
      }

      await tx
        .insert(profiles)
        .values({
          id: userId,
          workspaceId: workspace.id,
          email,
          fullName: parsed.data.fullName,
          avatarUrl: null,
          role: "owner",
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: {
            workspaceId: workspace.id,
            email,
            fullName: parsed.data.fullName,
            avatarUrl: null,
            role: "owner",
            updatedAt: new Date(),
          },
        });
    });
  } catch {
    await supabase.auth.admin.deleteUser(userId);

    return {
      success: false,
      message: "We could not finish creating the workspace. Please try again.",
    };
  }

  return {
    success: true,
    email,
  };
}
