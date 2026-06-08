import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";

type ProgressCardProps = {
  title: string;
  description?: string;
  progress: number;
  statusLabel?: string;
  statusTone?: "blue" | "green" | "yellow" | "red" | "purple" | "slate";
  icon?: LucideIcon;
};

export function ProgressCard({
  title,
  description,
  progress,
  statusLabel,
  statusTone = "blue",
  icon: Icon,
}: ProgressCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">{title}</h3>
              {statusLabel ? (
                <StatusBadge label={statusLabel} tone={statusTone} />
              ) : null}
            </div>

            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>

          {Icon ? (
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="size-5" />
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Progress</span>
            <span className="font-semibold text-slate-950">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardContent>
    </Card>
  );
}