import type { ReactNode } from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StackedCellProps = {
  children: ReactNode;
  className?: string;
};

export function StackedCell({ children, className }: StackedCellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col items-start gap-1", className)}>
      {children}
    </div>
  );
}

type BadgeWithMetaProps = {
  badge: ReactNode;
  meta?: ReactNode;
  className?: string;
  metaClassName?: string;
};

export function BadgeWithMeta({
  badge,
  meta,
  className,
  metaClassName,
}: BadgeWithMetaProps) {
  return (
    <StackedCell className={className}>
      {badge}
      {meta !== undefined && meta !== null ? (
        <span className={cn("text-xs text-slate-500", metaClassName)}>
          {meta}
        </span>
      ) : null}
    </StackedCell>
  );
}

type ProgressCellProps = {
  value: number;
  label?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  barClassName?: string;
};

export function ProgressCell({
  value,
  label = "Progress",
  className,
  labelClassName,
  valueClassName,
  barClassName,
}: ProgressCellProps) {
  return (
    <div className={cn("w-full max-w-[160px] min-w-0 space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={cn("min-w-0 text-slate-500", labelClassName)}>
          {label}
        </span>
        <span
          className={cn("shrink-0 font-medium text-slate-700", valueClassName)}
        >
          {value}%
        </span>
      </div>
      <Progress value={value} className={barClassName} />
    </div>
  );
}
