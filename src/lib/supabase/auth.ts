import "server-only";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export function getDashboardPathForRole(role: UserRole) {
  if (role === "admin") {
    return routes.admin.dashboard;
  }

  return routes.client.dashboard;
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

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function requireCurrentProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(routes.auth.login);
  }

  return profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireCurrentProfile();

  if (profile.role !== role) {
    redirect(getDashboardPathForRole(profile.role));
  }

  return profile;
}

export async function redirectIfAuthenticated() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(getDashboardPathForRole(profile.role));
  }
}