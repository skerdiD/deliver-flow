import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { AcceptInviteCard } from "@/features/invitations/accept-invite-card";
import { getInvitePreview } from "@/features/invitations/invite-data";
import { inviteTokenSchema } from "@/features/invitations/validation";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const metadata: Metadata = {
  title: "Accept invite",
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const parsedToken = inviteTokenSchema.safeParse(token);

  if (!parsedToken.success) {
    return <InviteStateCard title="Invalid invite" />;
  }

  const preview = await getInvitePreview(parsedToken.data);

  if (preview.status === "invalid") {
    return <InviteStateCard title="Invalid invite" />;
  }

  if (preview.status === "expired") {
    return (
      <InviteStateCard
        title="This invite has expired"
        description="Ask your project owner for a new invite."
      />
    );
  }

  if (preview.status === "accepted") {
    return (
      <InviteStateCard
        title="This invite has already been used"
        description="You can log in with the account created from this invite."
        actionLabel="Go to login"
      />
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <AcceptInviteCard
        token={parsedToken.data}
        email={preview.email}
        expiresAt={preview.expiresAt}
        authenticatedEmail={preview.authenticatedEmail}
        emailMatches={preview.emailMatches}
      />
    </main>
  );
}

function InviteStateCard(props: {
  title: string;
  description?: string;
  actionLabel?: string;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <Card className="w-full max-w-md rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            {props.description ??
              "This invite link is not valid. Check the link or ask your project owner for a new invite."}
          </p>
          <Button asChild>
            <Link href={routes.auth.login}>
              {props.actionLabel ?? "Back to login"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
