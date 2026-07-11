import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28 bg-slate-200" />
          <Skeleton className="h-8 w-48 bg-slate-200" />
          <Skeleton className="h-4 w-96 max-w-full bg-slate-200" />
        </div>
        <Skeleton className="h-10 w-full sm:w-72 bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
        <Skeleton className="h-96 rounded-lg bg-slate-200" />
        <Skeleton className="h-96 rounded-lg bg-slate-200" />
      </div>
      <Skeleton className="h-96 rounded-lg bg-slate-200" />
      <Skeleton className="h-72 rounded-lg bg-slate-200" />
    </div>
  );
}
