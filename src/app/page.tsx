import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import {
  getCurrentProfile,
  getDashboardPathForRole,
} from "@/lib/supabase/auth";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(routes.auth.login);
  }

  redirect(getDashboardPathForRole(profile.role));
}