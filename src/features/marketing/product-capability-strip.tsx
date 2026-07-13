import {
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  Files,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import { MarketingContainer } from "@/features/marketing/marketing-shared";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";

const capabilities = [
  [LayoutDashboard, "Owner workspace"],
  [ShieldCheck, "Dedicated client portal"],
  [Files, "Files & updates"],
  [BadgeCheck, "Feedback & approvals"],
  [CircleDollarSign, "Payment visibility"],
  [BarChart3, "Delivery analytics"],
] as const;

export function ProductCapabilityStrip() {
  return (
    <section
      className="marketing-surface-page py-7 sm:py-9"
      aria-label="DeliverFlow capabilities"
    >
      <MarketingContainer>
        <div className="marketing-panel-shadow grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3 lg:grid-cols-6">
          {capabilities.map(([Icon, label], index) => (
            <MarketingReveal
              key={label}
              delay={Math.min(index * 48, 240)}
              className={`flex min-h-16 items-center gap-2.5 border-slate-100 px-3 py-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-50/60 hover:text-slate-950 sm:text-sm lg:min-h-[4.75rem] lg:border-t-0 lg:px-4 ${index % 2 !== 0 ? "border-l" : ""} ${index >= 2 ? "border-t" : ""} ${index % 3 !== 0 ? "sm:border-l" : "sm:border-l-0"} ${index >= 3 ? "sm:border-t" : "sm:border-t-0"} ${index > 0 ? "lg:border-l" : "lg:border-l-0"}`}
            >
              <span className="marketing-card-icon grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100/80">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>{label}</span>
            </MarketingReveal>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
