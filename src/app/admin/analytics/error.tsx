"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Analytics could not load
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try loading the workspace analytics again. If the problem persists,
        return to the dashboard and try later.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
