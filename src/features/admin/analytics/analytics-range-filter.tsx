"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { AnalyticsRange } from "@/features/admin/analytics/types";
import { cn } from "@/lib/utils";

const options: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
];

export function AnalyticsRangeFilter({ value }: { value: AnalyticsRange }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectRange(range: AnalyticsRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      className="inline-flex w-full items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-auto"
      aria-label="Analytics date range"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          size="default"
          aria-pressed={value === option.value}
          onClick={() => selectRange(option.value)}
          className={cn(
            "h-8 flex-1 px-2.5 text-xs sm:flex-none",
            value === option.value &&
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
