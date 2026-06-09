"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { routes } from "@/config/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { UserRole } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getDashboardPath(role: UserRole) {
  if (role === "admin") {
    return routes.admin.dashboard;
  }

  return routes.client.dashboard;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState(() => {
    const error = searchParams.get("error");

    if (error === "profile_missing") {
      return "Your account is signed in, but no profile was found. Ask the admin to check your account setup.";
    }

    return "";
  });

  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("Email or password is incorrect.");
      setIsLoading(false);
      return;
    }

    const profileResult = await supabase
      .from("profiles")
      .select("role")
      .maybeSingle();

    const profile = profileResult.data as { role: UserRole } | null;
    const profileError = profileResult.error;

    if (profileError || !profile?.role) {
      setErrorMessage(
        "You signed in, but your profile could not be loaded. Please try again or contact the project owner.",
      );
      setIsLoading(false);
      return;
    }

    router.replace(getDashboardPath(profile.role));
    router.refresh();
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use your account to open your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              disabled={isLoading}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              disabled={isLoading}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
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
      </CardContent>
    </Card>
  );
}
