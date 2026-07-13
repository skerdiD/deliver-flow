import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  FileText,
  MessageSquareText,
} from "lucide-react";

import {
  DemoAction,
  MarketingContainer,
} from "@/features/marketing/marketing-shared";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";

const workflow = [
  [FileText, "Update shared", "Client viewed"],
  [MessageSquareText, "Feedback received", "2 notes"],
  [BadgeCheck, "Approval requested", "Waiting"],
  [CircleDollarSign, "Payment scheduled", "Jul 18"],
] as const;

export function FinalCtaSection() {
  return (
    <section id="demo" className="scroll-mt-20 bg-slate-50 pb-0 pt-8 sm:pt-12">
      <MarketingContainer>
        <MarketingReveal variant="scale-fade">
          <div className="marketing-dark-grid relative overflow-hidden rounded-t-[2rem] bg-slate-950 px-5 py-12 text-white shadow-[0_30px_80px_-44px_rgba(15,23,42,0.75)] sm:rounded-[2rem] sm:px-8 sm:py-14 lg:px-12">
          <div
            className="absolute -right-24 -top-32 size-96 rounded-full bg-blue-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-blue-300">
                See the complete delivery flow
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-[2.65rem]">
                Bring clarity to every client delivery.
              </h2>
              <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-300">
                Explore how projects, feedback, files, approvals, and payments
                stay connected from kickoff to completion.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <DemoAction
                  role="owner"
                  className="marketing-cta group h-12 rounded-lg bg-white px-5 text-slate-950 hover:bg-blue-50 focus-visible:ring-white"
                >
                  Explore owner demo
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </DemoAction>
                <DemoAction
                  role="client"
                  variant="ghost"
                  className="marketing-cta group h-12 rounded-lg border border-white/20 px-5 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white"
                >
                  View client portal
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </DemoAction>
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold">Website redesign</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Shared delivery workflow
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  On track
                </span>
              </div>
              <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
                {workflow.map(([Icon, title, meta], index) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-3"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg ${index < 2 ? "bg-blue-400/10 text-blue-300" : "bg-white/10 text-slate-300"}`}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{title}</p>
                      <p className="mt-0.5 text-[0.68rem] text-slate-400">
                        {meta}
                      </p>
                    </div>
                    <span
                      className={`size-2 rounded-full ${index < 2 ? "bg-emerald-400" : index === 2 ? "bg-amber-400" : "bg-slate-600"}`}
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </section>
  );
}
