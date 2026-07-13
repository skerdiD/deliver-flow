import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { demoLoginAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export function MarketingContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[86rem] px-5 sm:px-8 lg:px-10 xl:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "text-[0.7rem] font-bold uppercase tracking-[0.18em]",
          tone === "dark" ? "text-blue-300" : "text-blue-700",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[2.6rem]",
          tone === "dark" ? "text-white" : "text-slate-950",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-4 text-pretty text-base leading-7 sm:text-[1.05rem]",
          tone === "dark" ? "text-slate-300" : "text-slate-600",
        )}
      >
        {description}
      </p>
    </div>
  );
}

export function DemoAction({
  role,
  children,
  variant = "default",
  size = "lg",
  className,
}: {
  role: "owner" | "client";
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <form action={demoLoginAction} className="contents">
      <input type="hidden" name="role" value={role} />
      <Button type="submit" size={size} variant={variant} className={className}>
        {children}
      </Button>
    </form>
  );
}

export function ProductWindow({
  label,
  title,
  children,
  className,
  dark = false,
}: {
  label: string;
  title: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "marketing-panel-shadow overflow-hidden rounded-[1.35rem] border",
        dark
          ? "border-white/10 bg-slate-900 text-white"
          : "border-slate-200/90 bg-white text-slate-950",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-12 items-center justify-between gap-4 border-b px-4",
          dark ? "border-white/10" : "border-slate-100",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span
              className={cn(
                "size-2 rounded-full",
                dark ? "bg-white/20" : "bg-slate-200",
              )}
            />
            <span
              className={cn(
                "size-2 rounded-full",
                dark ? "bg-white/20" : "bg-slate-200",
              )}
            />
            <span
              className={cn(
                "size-2 rounded-full",
                dark ? "bg-blue-400" : "bg-blue-600",
              )}
            />
          </span>
          <span
            className={cn(
              "ml-1 text-[0.68rem] font-semibold",
              dark ? "text-slate-300" : "text-slate-500",
            )}
          >
            {label}
          </span>
        </div>
        <span className="truncate text-xs font-semibold">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function PreviewMetric({
  label,
  value,
  icon: Icon,
  tone = "slate",
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "slate" | "blue" | "green" | "amber";
  className?: string;
}) {
  const tones = {
    slate: "bg-slate-50 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  } as const;

  return (
    <div className={cn("rounded-xl p-3", tones[tone], className)}>
      <div className="flex items-center gap-1.5 text-[0.68rem] font-medium opacity-80">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function StatusDot({
  tone,
  label,
}: {
  tone: "green" | "amber" | "blue";
  label: string;
}) {
  const tones = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
  } as const;

  return (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-slate-600">
      <span className={cn("size-1.5 rounded-full", tones[tone])} />
      {label}
    </span>
  );
}
