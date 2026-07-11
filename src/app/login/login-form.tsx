"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  BriefcaseBusiness,
  Loader2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { routes } from "@/config/routes";
import { demoLoginAction } from "@/features/auth/actions";
import { loginSchema, type LoginValues } from "@/features/auth/auth-validation";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_CLIENT_EMAIL,
  DEMO_SHARED_PASSWORD,
} from "@/lib/demo";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  getDashboardPathForRole,
  isSupportedRole,
} from "@/lib/supabase/route-protection";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return routes.home;
  }

  return value;
}

function DemoLoginButton({
  role,
  children,
  className,
}: {
  role: "owner" | "client";
  children: ReactNode;
  className: string;
}) {
  const { data, pending } = useFormStatus();
  const isSubmitting = pending && data?.get("role") === role;

  return (
    <Button
      type="submit"
      name="role"
      value={role}
      variant="outline"
      className={className}
      disabled={pending}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Opening demo...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authError, setAuthError] = useState(() => {
    const error = searchParams.get("error");

    if (error === "profile_missing") {
      return "Your account exists, but your profile is not ready yet. Ask the project owner to check your access.";
    }

    if (error === "role_invalid") {
      return "We could not confirm your account role. Ask the project owner to review your access.";
    }

    if (error === "client_missing") {
      return "Your account is not linked to an active client yet. Open your invite link or ask for a new one.";
    }

    if (error === "demo_unavailable") {
      return "Demo login is not available right now. Use the credentials below or try the demo buttons again in a moment.";
    }

    if (error === "demo_signin_failed") {
      return "We could not open the demo account right now. Please try again in a moment.";
    }

    return "";
  });

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    setAuthError("");

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAuthError("Email or password is incorrect.");
        setIsLoading(false);
        return;
      }

      if (!user) {
        setAuthError("Email or password is incorrect.");
        setIsLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const profile = profileData as { role: unknown } | null;

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setAuthError(
          "Your account exists, but your workspace profile is not ready yet. Ask the workspace owner to check your access.",
        );
        setIsLoading(false);
        return;
      }

      if (!isSupportedRole(profile.role)) {
        await supabase.auth.signOut();
        setAuthError(
          "We could not confirm your account role. Ask the workspace owner to review your access.",
        );
        setIsLoading(false);
        return;
      }

      const nextPath = getSafeNextPath(searchParams.get("next"));
      const dashboardPath = getDashboardPathForRole(profile.role);

      router.replace(nextPath === routes.home ? dashboardPath : nextPath);
      router.refresh();
    } catch {
      setAuthError(
        "We could not sign you in right now. Please try again in a moment.",
      );
      setIsLoading(false);
    }
  }

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {authError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-11 w-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-950">
              Try the demo
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Explore DeliverFlow as an admin or as a client. You can sign in
              instantly with the buttons or use the credentials below.
            </p>
          </div>

          <form
            action={demoLoginAction}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <DemoLoginButton
              role="owner"
              className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              <BriefcaseBusiness className="size-4" />
              View admin demo
            </DemoLoginButton>
            <DemoLoginButton
              role="client"
              className="h-11 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <UserRound className="size-4" />
              View client demo
            </DemoLoginButton>
          </form>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Admin demo credentials
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-950">
                {DEMO_ADMIN_EMAIL}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {DEMO_SHARED_PASSWORD}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Client demo credentials
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-950">
                {DEMO_CLIENT_EMAIL}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {DEMO_SHARED_PASSWORD}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-200 px-5 py-4 sm:px-6">
        <p className="w-full text-center text-sm leading-6 text-slate-600">
          Starting a workspace?{" "}
          <Link
            href={routes.auth.signup}
            prefetch
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            Create an account.
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
