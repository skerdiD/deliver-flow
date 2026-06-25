"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  acceptInviteAction,
  acceptSignedInInviteAction,
  type AcceptInviteActionState,
} from "@/features/invitations/actions";
import { routes } from "@/config/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AcceptInviteCardProps = {
  token: string;
  email: string;
  expiresAt: string;
  authenticatedEmail: string | null;
  emailMatches: boolean;
};

const initialState: AcceptInviteActionState = {
  success: false,
  message: "",
};

export function AcceptInviteCard({
  token,
  email,
  expiresAt,
  authenticatedEmail,
  emailMatches,
}: AcceptInviteCardProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    acceptInviteAction,
    initialState,
  );
  const [signedInState, signedInFormAction, isSignedInPending] =
    useActionState(acceptSignedInInviteAction, initialState);
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!authenticatedEmail && data.session?.user) {
        router.refresh();
      }
    });
  }, [authenticatedEmail, router]);

  useEffect(() => {
    if (!state.success || !state.email) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .signInWithPassword({
        email: state.email,
        password,
      })
      .then(({ error }) => {
        if (error) {
          setSignInError(
            "Your account is ready. Sign in with the password you just created.",
          );
          return;
        }

        router.push("/client/dashboard");
        router.refresh();
      });
  }, [password, router, state.email, state.success]);

  useEffect(() => {
    if (!signedInState.success) {
      return;
    }

    router.push("/client/dashboard");
    router.refresh();
  }, [router, signedInState.success]);

  const statusMessage = signInError || signedInState.message || state.message;
  const statusIsSuccess = signedInState.success || state.success;

  return (
    <Card className="w-full max-w-md rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Create your client account</CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          This secure invite is for{" "}
          <span className="font-medium">{email}</span>. Set your password to
          access your portal.
        </p>
        <p className="text-xs text-slate-500">
          Expires {new Date(expiresAt).toLocaleDateString()}.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {authenticatedEmail && !emailMatches ? (
          <Alert variant={emailMatches ? "default" : "destructive"}>
            <AlertCircle className="size-4" />
            <AlertDescription>
              You are signed in as {authenticatedEmail}. Sign in with the
              invited email to continue.
            </AlertDescription>
          </Alert>
        ) : null}

        {authenticatedEmail && emailMatches ? (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              You are signed in with the invited email. Accept the invite to
              open your portal.
            </AlertDescription>
          </Alert>
        ) : null}

        {statusMessage ? (
          <Alert variant={statusIsSuccess ? "default" : "destructive"}>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        ) : null}

        {!authenticatedEmail ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-2">
              <Label htmlFor="invite-password">Password</Label>
              <Input
                id="invite-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending || state.success}
              />
              {state.fieldErrors?.password ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.password}
                </p>
              ) : (
                <p className="text-xs leading-5 text-slate-500">
                  Use at least 10 characters with uppercase, lowercase, and a
                  number.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-confirm-password">Confirm password</Label>
              <Input
                id="invite-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isPending || state.success}
              />
              {state.fieldErrors?.confirmPassword ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Create account
            </Button>
          </form>
        ) : emailMatches ? (
          <form action={signedInFormAction}>
            <input type="hidden" name="token" value={token} />
            <Button
              type="submit"
              className="w-full"
              disabled={isSignedInPending || signedInState.success}
            >
              {isSignedInPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Accept invite
            </Button>
          </form>
        ) : (
          <Button asChild className="w-full" variant="outline">
            <Link href={routes.auth.login}>
              Go to login
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
