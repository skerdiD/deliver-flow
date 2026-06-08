import type { Metadata } from "next";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Client Dashboard",
};

export default async function ClientDashboardPage() {
  const profile = await requireRole("client");

  return (
    <DashboardShell
      eyebrow="Client portal"
      title="Client Dashboard"
      description="Check project progress, updates, approvals, files, and payment status."
    >
      <Card>
        <CardHeader>
          <CardTitle>
            Hi{profile.full_name ? `, ${profile.full_name}` : ""}.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            Your client portal is protected. Next, you can show only this
            client’s assigned project, progress, updates, files, approvals, and
            feedback here.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}