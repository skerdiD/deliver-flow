import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create workspace",
};

export default async function SignupPage() {
  await redirectIfAuthenticated();

  return (
    <AuthShell
      title="Create your DeliverFlow workspace"
      description="Start a workspace to manage clients, projects, files, payments, feedback, and approvals."
    >
      <SignupForm />
    </AuthShell>
  );
}
