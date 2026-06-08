import type { Metadata } from "next";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const profile = await requireRole("admin");

  return (
    <DashboardShell
      eyebrow="Admin workspace"
      title="Admin Dashboard"
      description="Manage clients, projects, updates, approvals, files, and payments from one place."
    >
      <Card>
        <CardHeader>
          <CardTitle>
            Hi{profile.full_name ? `, ${profile.full_name}` : ""}.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            Your admin area is protected. Next, you can build the project,
            clients, milestones, files, payments, and approvals screens here.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}