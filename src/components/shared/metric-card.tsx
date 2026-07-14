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
    <Card className={cn("border-border", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-5 text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 truncate text-2xl font-semibold leading-8 text-foreground sm:text-[1.625rem]">
              {value}
            </p>
          </div>

          {Icon ? (
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
              <Icon className="size-5" />
            </div>
          ) : null}
        </div>

        {description || trend ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {description ? (
              <p className="text-sm leading-5 text-muted-foreground">
                {description}
              </p>
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
