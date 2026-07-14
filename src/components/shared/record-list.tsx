import type { ReactNode } from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type RecordListProps = {
  children: ReactNode;
  className?: string;
};

export function RecordList({ children, className }: RecordListProps) {
  return (
    <div
      className={cn(
        "space-y-3 px-4 pb-4 sm:px-5 xl:space-y-0 xl:border-t xl:border-border xl:px-0 xl:pb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

type RecordHeaderProps = {
  columns: string[];
  className?: string;
};

export function RecordHeader({ columns, className }: RecordHeaderProps) {
  return (
    <div
      className={cn(
        "hidden border-b border-border bg-muted px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:px-6 xl:grid xl:items-center",
        className,
      )}
    >
      {columns.map((column, index) => (
        <div
          key={column}
          className={cn(
            "min-w-0",
            index === columns.length - 1 && "xl:text-right",
          )}
        >
          {column}
        </div>
      ))}
    </div>
  );
}

type RecordRowProps = {
  children: ReactNode;
  className?: string;
};

export function RecordRow({ children, className }: RecordRowProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm xl:rounded-none xl:border-x-0 xl:border-t-0 xl:px-5 xl:py-5 xl:shadow-none xl:last:border-b-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

type RecordFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function RecordField({
  label,
  children,
  className,
  labelClassName,
  valueClassName,
}: RecordFieldProps) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
      </p>
      <div className={cn("min-w-0 text-sm text-foreground", valueClassName)}>
        {children}
      </div>
    </div>
  );
}

type ProgressFieldProps = {
  label?: string;
  value: number;
  className?: string;
  labelClassName?: string;
};

export function ProgressField({
  label = "Progress",
  value,
  className,
  labelClassName,
}: ProgressFieldProps) {
  return (
    <RecordField
      label={label}
      className={className}
      labelClassName={labelClassName}
    >
      <div className="w-full min-w-0 max-w-40 space-y-2">
        <p className="font-semibold text-foreground">{value}%</p>
        <Progress value={value} />
      </div>
    </RecordField>
  );
}

type BadgeMetaFieldProps = {
  label: string;
  badge: ReactNode;
  meta?: ReactNode;
  className?: string;
  labelClassName?: string;
  metaClassName?: string;
};

export function BadgeMetaField({
  label,
  badge,
  meta,
  className,
  labelClassName,
  metaClassName,
}: BadgeMetaFieldProps) {
  return (
    <RecordField
      label={label}
      className={className}
      labelClassName={labelClassName}
    >
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        {badge}
        {meta !== undefined && meta !== null ? (
          <span className={cn("text-xs text-muted-foreground", metaClassName)}>
            {meta}
          </span>
        ) : null}
      </div>
    </RecordField>
  );
}

type RowActionsProps = {
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

export function RowActions({
  children,
  className,
  labelClassName,
}: RowActionsProps) {
  return (
    <div className={cn("min-w-0 space-y-1.5 xl:text-right", className)}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
          labelClassName,
        )}
      >
        Actions
      </p>
      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap xl:justify-end">
        {children}
      </div>
    </div>
  );
}
