import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-slate-950 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-950",
  outline:
    "border border-slate-200 bg-white text-slate-950 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-950",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-600",
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}