import { Mail, UserPlus, Users } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminTeamSettingsData } from "@/features/admin/operations/types";

type TeamSettingsPageProps = {
  data: AdminTeamSettingsData;
};

export function TeamSettingsPage({ data }: TeamSettingsPageProps) {
  const additionalMembers = data.members.filter(
    (member) => member.role !== "owner",
  );

  return (
    <div className="space-y-6">
      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Workspace members</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              People with access to this workspace.
            </p>
          </div>
          <Button type="button" variant="outline" disabled>
            <UserPlus className="size-4" />
            Invite member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-normal text-slate-500 md:grid">
              <span>Member</span>
              <span>Email</span>
              <span>Role</span>
            </div>

            <div className="divide-y divide-slate-200">
              {data.members.map((member) => (
                <div
                  key={member.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950">
                        {member.fullName ?? "Unnamed member"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                    <Mail className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  <div className="flex md:justify-end">
                    <RoleBadge role={member.role} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {additionalMembers.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="font-medium text-slate-950">
                No team members invited yet
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Future team invitations will appear here with their workspace
                role.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1);

  if (role === "owner") {
    return <StatusBadge label={label} tone="purple" />;
  }

  return <StatusBadge label="Client" tone="slate" />;
}
