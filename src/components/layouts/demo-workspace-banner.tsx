import { RefreshCw } from "lucide-react";

export function DemoWorkspaceBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <RefreshCw className="size-4 shrink-0" />
        <span>Demo workspace — changes may be reset.</span>
      </div>
    </div>
  );
}
