import * as React from "react";

import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive";
};

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-4 text-sm",
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-700",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("leading-5", className)} {...props} />;
}