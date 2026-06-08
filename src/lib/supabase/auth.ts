import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

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

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to access this resource.");
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
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function requireCurrentProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new Error("Profile not found for the current user.");
  }

  return profile;
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();

  return profile?.role ?? null;
}

export async function requireAdminProfile(): Promise<Profile> {
  const profile = await requireCurrentProfile();

  if (profile.role !== "admin") {
    throw new Error("Admin access is required for this action.");
  }

  return profile;
}

export async function isCurrentUserAdmin() {
  const role = await getCurrentUserRole();

  return role === "admin";
}

export async function getCurrentClientRecord() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}