import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage projects or check delivery progress."
    >
      <LoginForm />
    </AuthShell>
  );
}
