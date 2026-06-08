import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("rounded-2xl border-slate-200 shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          </div>

          {Icon ? (
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="size-5" />
            </div>
          ) : null}
        </div>

        {description || trend ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}

            {trend ? (
              <p className="text-sm font-medium text-emerald-600">{trend}</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}