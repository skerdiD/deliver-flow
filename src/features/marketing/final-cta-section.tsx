import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  MessageSquareText,
} from "lucide-react";

import { MarketingReveal } from "@/features/marketing/marketing-reveal";
import {
  DemoAction,
  MarketingContainer,
} from "@/features/marketing/marketing-shared";

export function FinalCtaSection() {
  return (
    <section
      id="demo"
      className="marketing-surface-page scroll-mt-20 py-14 sm:py-18 lg:py-20"
    >
      <MarketingContainer>
        <MarketingReveal variant="scale-fade">
          <div className="marketing-cta-panel marketing-dark-grid relative overflow-hidden rounded-[2rem] border border-blue-300/15 px-5 py-10 text-white shadow-[0_32px_90px_-46px_rgba(15,23,42,0.78)] sm:px-8 sm:py-12 lg:px-12">
            <div className="relative grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14">
              <div className="max-w-2xl">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-blue-300">
                  See the complete delivery flow
                </p>
                <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-[2.65rem]">
                  Bring clarity to every client delivery.
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-300">
                  Keep projects, files, feedback, approvals, and payments
                  connected from kickoff to final handoff.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <DemoAction
                    role="owner"
                    className="marketing-cta group h-12 rounded-lg bg-white px-5 text-slate-950 shadow-lg shadow-black/15 hover:bg-blue-50 focus-visible:ring-white active:translate-y-px"
                  >
                    Explore owner demo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </DemoAction>
                  <DemoAction
                    role="client"
                    variant="ghost"
                    className="marketing-cta group h-12 rounded-lg border border-white/25 px-5 text-white hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:ring-white active:translate-y-px"
                  >
                    View client portal
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </DemoAction>
                </div>
              </div>

              <WorkflowPreview />
            </div>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </section>
  );
}

function WorkflowPreview() {
  return (
    <div
      className="relative rounded-[1.35rem] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-4"
      aria-label="Website redesign delivery status preview"
    >
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-blue-300">
              Project
            </p>
            <p className="mt-1.5 text-sm font-semibold sm:text-base">
              Website redesign
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-200 ring-1 ring-blue-300/15">
            <span className="size-1.5 rounded-full bg-blue-400" />
            In review
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Delivery progress
            </p>
            <p className="mt-1 text-xs text-slate-300">
              4 of 5 milestones complete
            </p>
          </div>
          <span className="text-xl font-semibold tracking-tight">82%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="marketing-progress h-full w-[82%] rounded-full bg-blue-400" />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.07] p-3">
          <span className="marketing-card-icon grid size-9 shrink-0 place-items-center rounded-lg bg-amber-300/10 text-amber-200">
            <BadgeCheck className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Homepage approval</p>
            <p className="mt-0.5 text-xs text-slate-300">
              Waiting for client decision
            </p>
          </div>
          <span className="rounded-full bg-amber-300/10 px-2 py-1 text-[0.7rem] font-semibold text-amber-200">
            Waiting
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <WorkflowSignal
          icon={MessageSquareText}
          label="Client feedback"
          value="2 new notes"
          tone="blue"
        />
        <WorkflowSignal
          icon={CircleDollarSign}
          label="Final payment"
          value="$2,400 due soon"
          tone="amber"
        />
      </div>
    </div>
  );
}

function WorkflowSignal({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof MessageSquareText;
  label: string;
  value: string;
  tone: "blue" | "amber";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3.5">
      <span
        className={`marketing-card-icon grid size-9 shrink-0 place-items-center rounded-lg ${
          tone === "blue"
            ? "bg-blue-400/10 text-blue-200"
            : "bg-amber-300/10 text-amber-200"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-300">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
