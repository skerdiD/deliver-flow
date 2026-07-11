import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { LandingPage } from "@/features/marketing/landing-page";
import { getAuthState } from "@/lib/supabase/auth";
import { getDashboardPathForRole } from "@/lib/supabase/route-protection";

export default async function HomePage() {
  const authState = await getAuthState();

  if (authState.status === "authenticated") {
    redirect(getDashboardPathForRole(authState.profile.role));
  }

  if (authState.status === "missing_profile") {
    redirect(`${routes.auth.login}?error=profile_missing`);
  }

  if (authState.status === "missing_client") {
    redirect(`${routes.auth.login}?error=client_missing`);
  }

  if (authState.status === "invalid_role") {
    redirect(`${routes.auth.login}?error=role_invalid`);
  }

  return <LandingPage />;
}
