"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  acceptInviteAction,
  type AcceptInviteActionState,
} from "@/features/invitations/actions";
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

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!authenticatedEmail && data.session?.user) {
        router.refresh();
      }
    });
  }, [authenticatedEmail, router]);

  useEffect(() => {
    if (state.success) {
      router.push("/client/dashboard");
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Card className="w-full max-w-md rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Accept your DeliverFlow invite</CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          This invite is for <span className="font-medium">{email}</span> and
          expires on {new Date(expiresAt).toLocaleDateString()}.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!authenticatedEmail ? (
          <Alert>
            <AlertDescription>
              Sign in with the invited email before accepting this invite.
            </AlertDescription>
          </Alert>
        ) : null}

        {authenticatedEmail && !emailMatches ? (
          <Alert variant="destructive">
            <AlertDescription>
              You are signed in as {authenticatedEmail}. This invite belongs to
              {" "}
              {email}.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.message ? (
          <Alert variant={state.success ? "default" : "destructive"}>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        {authenticatedEmail && emailMatches ? (
          <form action={formAction}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Accept invite
            </Button>
          </form>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/login?next=/invite/${encodeURIComponent(token)}`}>
              Sign in to continue
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
