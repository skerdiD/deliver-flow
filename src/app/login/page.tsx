import type { Metadata } from "next";

import { LoginForm } from "@/app/login/login-form";
import { redirectIfAuthenticated } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-slate-500">DeliverFlow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Sign in to manage projects or check delivery progress.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-slate-500">
          Keep project updates, approvals, and files in one place.
        </p>
      </div>
    </main>
  );
}