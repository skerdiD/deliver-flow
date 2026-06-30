import { Skeleton } from "@/components/ui/skeleton";

export default function ClientLoading() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-3 w-24 bg-slate-200" />
        <Skeleton className="h-8 w-72 bg-slate-200" />
        <Skeleton className="h-4 w-full max-w-xl bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-lg bg-slate-200" />
        <Skeleton className="h-32 rounded-lg bg-slate-200" />
        <Skeleton className="h-32 rounded-lg bg-slate-200" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.85fr)]">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-44 bg-slate-200" />
          <Skeleton className="h-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-16 rounded-lg bg-slate-200" />
        </div>

        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-40 bg-slate-200" />
          <Skeleton className="h-24 rounded-lg bg-slate-200" />
          <Skeleton className="h-24 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
