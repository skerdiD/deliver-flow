import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileRecordListProps = {
  children: ReactNode;
  className?: string;
};

export function MobileRecordList({
  children,
  className,
}: MobileRecordListProps) {
  return <div className={cn("space-y-3 lg:hidden", className)}>{children}</div>;
}

type MobileRecordCardProps = {
  children: ReactNode;
  className?: string;
};

export function MobileRecordCard({
  children,
  className,
}: MobileRecordCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

type MobileRecordMetaProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function MobileRecordMeta({
  label,
  children,
  className,
}: MobileRecordMetaProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-500">
        {label}
      </p>
      <div className="mt-1 min-w-0 text-sm text-slate-700">{children}</div>
    </div>
  );
}

type MobileRecordActionsProps = {
  children: ReactNode;
  className?: string;
};

export function MobileRecordActions({
  children,
  className,
}: MobileRecordActionsProps) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
