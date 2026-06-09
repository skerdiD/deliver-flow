import { redirect } from "next/navigation";

import {
  getDashboardPathForRole,
  requireCurrentProfile,
} from "@/lib/supabase/auth";

export default async function HomePage() {
  const profile = await requireCurrentProfile();

  redirect(getDashboardPathForRole(profile.role));
}
