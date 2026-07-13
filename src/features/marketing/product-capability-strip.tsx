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
      className="border-b border-slate-200/80 bg-white"
      aria-label="DeliverFlow capabilities"
    >
      <MarketingContainer className="grid grid-cols-2 py-5 sm:grid-cols-3 lg:grid-cols-6 lg:py-0">
        {capabilities.map(([Icon, label], index) => (
          <MarketingReveal
            key={label}
            delay={index * 80}
            className={`flex min-h-14 items-center gap-2.5 py-2 text-xs font-semibold text-slate-600 sm:text-sm lg:px-4 lg:py-5 ${index > 0 ? "lg:border-l lg:border-slate-200" : ""}`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span>{label}</span>
          </MarketingReveal>
        ))}
      </MarketingContainer>
    </section>
  );
}
