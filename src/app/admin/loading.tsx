import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-3 w-24 bg-slate-200" />
        <Skeleton className="h-8 w-80 max-w-full bg-slate-200" />
        <Skeleton className="h-4 w-full max-w-2xl bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-lg bg-slate-200" />
        <Skeleton className="h-28 rounded-lg bg-slate-200" />
        <Skeleton className="h-28 rounded-lg bg-slate-200" />
        <Skeleton className="h-28 rounded-lg bg-slate-200" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-44 bg-slate-200" />
          <Skeleton className="h-10 w-full max-w-xs bg-slate-200" />
        </div>

        <div className="mt-5 space-y-3">
          <Skeleton className="h-14 rounded-lg bg-slate-200" />
          <Skeleton className="h-14 rounded-lg bg-slate-200" />
          <Skeleton className="h-14 rounded-lg bg-slate-200" />
          <Skeleton className="h-14 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
