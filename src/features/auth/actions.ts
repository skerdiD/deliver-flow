"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { profiles, workspaces } from "@/db/schema";
import { signupSchema, type SignupValues } from "@/features/auth/auth-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
