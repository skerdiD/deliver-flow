"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Something went wrong.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          We could not complete that request. The error has been recorded.
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}
