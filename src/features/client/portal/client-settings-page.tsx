import { BellRing, Settings, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTimeLabel } from "@/features/admin/operations/types";

type ClientSettingsPageProps = {
  fullName: string | null;
  email: string;
  createdAt: string;
};

export function ClientSettingsPage({
  fullName,
  email,
  createdAt,
}: ClientSettingsPageProps) {
  return (
    <Card className="max-w-4xl rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Profile and account</CardTitle>
        <p className="text-sm text-slate-500">
          Basic client account details come from Supabase Auth and the profiles
          table.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <SettingRow
          icon={UserRound}
          label="Display name"
          value={fullName ?? "No full name saved yet"}
          description="This is the name shown in your client portal."
        />
        <SettingRow
          icon={Settings}
          label="Account email"
          value={email}
          description="Used for sign-in and account identification."
        />
        <SettingRow
          icon={BellRing}
          label="Portal access"
          value="Client"
          description={`Client portal access enabled since ${formatDateTimeLabel(createdAt)}.`}
        />
      </CardContent>
    </Card>
  );
}

function SettingRow(props: {
  icon: typeof UserRound;
  label: string;
  value: string;
  description: string;
}) {
  const Icon = props.icon;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-slate-500">{props.label}</p>
          <p className="break-words text-base font-semibold text-slate-950">
            {props.value}
          </p>
          <p className="break-words text-sm leading-6 text-slate-600">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
}
