import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center sm:min-h-64 sm:px-8">
      {Icon ? (
        <div className="mb-4 grid size-11 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
          <Icon className="size-5" />
        </div>
      ) : null}

      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      {actionLabel ? (
        <Button className="mt-5 w-full sm:w-auto" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
