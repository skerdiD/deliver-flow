"use client";

import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateWorkspaceNameAction } from "@/features/admin/operations/actions";
import { formatFileSize } from "@/features/admin/operations/types";
import type { AdminWorkspaceSettingsData } from "@/features/admin/operations/types";

type WorkspaceSettingsPageProps = {
  data: AdminWorkspaceSettingsData;
};

export function WorkspaceSettingsPage({ data }: WorkspaceSettingsPageProps) {
  const [name, setName] = useState(data.name);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const usagePercent =
    data.storageQuotaBytes > 0
      ? Math.min(
          100,
          Math.round((data.storageUsedBytes / data.storageQuotaBytes) * 100),
        )
      : 0;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const result = await updateWorkspaceNameAction({ name });

    setMessage(result.message);
    setIsSaving(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Workspace information</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            This name appears across the Owner workspace for your team.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="workspace-name"
                className="text-sm font-medium text-slate-700"
              >
                Workspace name
              </label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isSaving || name.trim() === data.name}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save workspace"
                )}
              </Button>
              {message ? (
                <p className="text-sm text-slate-600">{message}</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <DetailRow
            icon={Building2}
            label="Workspace slug"
            value={data.slug}
          />
          <DetailRow icon={CheckCircle2} label="Workspace ID" value={data.id} />
          <DetailRow
            icon={CheckCircle2}
            label="Storage usage"
            value={`${formatFileSize(data.storageUsedBytes)} of ${formatFileSize(
              data.storageQuotaBytes,
            )} used (${usagePercent}%)`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow(props: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  const Icon = props.icon;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-950">{props.label}</p>
          <p className="mt-1 break-words leading-6">{props.value}</p>
        </div>
      </div>
    </div>
  );
}
