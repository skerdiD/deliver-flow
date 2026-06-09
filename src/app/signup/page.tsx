import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import { SignupForm } from "@/app/signup/signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage() {
  await redirectIfAuthenticated();

  return (
    <AuthShell
      eyebrow="Create account"
      title="Create your DeliverFlow account"
      description="Set up your client portal and keep project updates, approvals, and files in one place."
    >
      <SignupForm />
    </AuthShell>
  );
}