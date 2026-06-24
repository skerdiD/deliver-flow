"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect(routes.auth.login);
} 