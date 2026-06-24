import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-950/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-300 aria-invalid:ring-red-500/10",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
