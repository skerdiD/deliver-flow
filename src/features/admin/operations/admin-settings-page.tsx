import { BellRing, Settings, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDateTimeLabel,
  type AdminSettingsData,
} from "@/features/admin/operations/types";

type AdminSettingsPageProps = {
  data: AdminSettingsData;
};

export function AdminSettingsPage({ data }: AdminSettingsPageProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Profile and account</CardTitle>
          <p className="text-sm text-slate-500">
            Basic admin account details currently come from Supabase Auth and
            the profiles table.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <SettingRow
            icon={UserRound}
            label="Display name"
            value={data.fullName ?? "No full name saved yet"}
            description="Update this in your profile record when you want the admin workspace to show a personal name."
          />
          <SettingRow
            icon={Settings}
            label="Account email"
            value={data.email}
            description="Used for sign-in and account identification."
          />
          <SettingRow
            icon={BellRing}
            label="Workspace access"
            value={data.role === "admin" ? "Admin" : data.role}
            description={`Admin access enabled since ${formatDateTimeLabel(data.createdAt)}.`}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>App preferences</CardTitle>
            <p className="text-sm text-slate-500">
              Keep the defaults practical while we wait for full persistence.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <PreferenceRow
              title="Dashboard focus"
              value="Show active work, open payments, and fresh feedback first."
            />
            <PreferenceRow
              title="Notification habit"
              value="Use email and in-app review passes before each delivery milestone."
            />
            <PreferenceRow
              title="Timezone"
              value="Dates render in the browser locale, with database timestamps stored server-side."
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Delivery preferences</CardTitle>
            <p className="text-sm text-slate-500">
              These are realistic placeholders until we add editable settings.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <PreferenceRow
              title="Client updates"
              value="Share concise updates with human language and a clear next step."
            />
            <PreferenceRow
              title="Approval reminders"
              value="Follow up on pending approvals before deadlines slip."
            />
            <PreferenceRow
              title="Payment default"
              value="Track invoice status in the dashboard and keep overdue items visible."
            />
          </CardContent>
        </Card>
      </div>
    </div>
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
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{props.label}</p>
          <p className="text-base font-semibold text-slate-950">{props.value}</p>
          <p className="text-sm leading-6 text-slate-600">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow(props: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="font-medium text-slate-950">{props.title}</p>
      <p className="mt-2 leading-6 text-slate-600">{props.value}</p>
    </div>
  );
}
