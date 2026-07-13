import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  DemoAction,
  MarketingContainer,
  PreviewMetric,
  ProductWindow,
  StatusDot,
} from "@/features/marketing/marketing-shared";

export function HeroSection() {
  return (
    <section className="marketing-surface-page relative isolate border-b border-slate-200/70">
      <div className="marketing-grid absolute inset-x-0 top-0 -z-10 h-[38rem] opacity-70" />
      <div
        className="absolute left-[8%] top-16 -z-10 size-80 rounded-full bg-blue-200/35 blur-3xl"
        aria-hidden="true"
      />
      <MarketingContainer className="grid gap-11 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-center lg:gap-12 lg:pb-24 lg:pt-18">
        <div className="marketing-reveal max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm shadow-blue-950/5">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Client delivery, without the chaos
          </div>
          <h1 className="mt-6 text-balance text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-[3.5rem] lg:text-[3.75rem] xl:text-[4.2rem]">
            Keep every project clear.
            <span className="mt-1 block text-blue-700">
              Keep every client confident.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            DeliverFlow brings progress, files, feedback, approvals, milestones,
            and payments into one shared delivery workspace for you and your
            clients.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <DemoAction
              role="owner"
              className="marketing-cta group h-12 rounded-lg bg-blue-600 px-5 shadow-lg shadow-blue-950/15 hover:bg-blue-700 focus-visible:ring-blue-600"
            >
              Explore owner demo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </DemoAction>
            <DemoAction
              role="client"
              variant="outline"
              className="marketing-cta group h-12 rounded-lg border-slate-300 bg-white/80 px-5"
            >
              View client portal
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </DemoAction>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-slate-600">
            {[
              "Owner workspace",
              "Dedicated client portal",
              "Secure role-based access",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-blue-700"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroProductPreview />
      </MarketingContainer>
    </section>
  );
}

function HeroProductPreview() {
  return (
    <div
      className="marketing-reveal marketing-delay-2 relative mx-auto w-full max-w-2xl lg:max-w-none"
      aria-label="DeliverFlow project delivery preview"
    >
      <div
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_70%_35%,rgba(59,130,246,0.18),transparent_44%)]"
        aria-hidden="true"
      />
      <ProductWindow
        label="CLIENT PORTAL"
        title="Northstar website redesign"
        className="relative p-0 shadow-[0_38px_90px_-38px_rgba(15,23,42,0.46)]"
      >
        <div className="grid min-h-[25rem] grid-cols-[3.25rem_minmax(0,1fr)] bg-slate-50/80 sm:min-h-[27rem] sm:grid-cols-[4.25rem_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-4 border-r border-slate-100 bg-white px-2 py-4 sm:px-3">
            <div className="grid size-8 place-items-center rounded-lg bg-slate-950 text-[0.62rem] font-bold text-white">
              DF
            </div>
            <div className="mt-2 grid gap-3" aria-hidden="true">
              <span className="size-7 rounded-lg bg-blue-50 ring-1 ring-blue-100" />
              <span className="size-7 rounded-lg bg-slate-100" />
              <span className="size-7 rounded-lg bg-slate-100" />
              <span className="size-7 rounded-lg bg-slate-100" />
            </div>
          </div>

          <div className="min-w-0 p-3 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-blue-700">
                  Project overview
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">
                  Website redesign
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-700">
                On track
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-950">
                    Delivery progress
                  </p>
                  <p className="mt-1 text-[0.68rem] text-slate-500">
                    4 of 5 milestones complete
                  </p>
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  82%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="marketing-progress h-full w-[82%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-blue-700">
                    Current milestone
                  </p>
                  <StatusDot tone="amber" label="In review" />
                </div>
                <p className="mt-3 text-sm font-semibold">
                  Homepage design review
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-600">
                  Latest direction shared. Client approval is the next step.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-2.5 py-2 text-[0.68rem] font-medium text-slate-700">
                  <FileText className="size-3.5 text-blue-700" />
                  homepage-v3.pdf
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4">
                <p className="text-xs font-semibold">Ready for review</p>
                <div className="mt-3 space-y-2.5">
                  <PreviewRow
                    icon={BadgeCheck}
                    label="Approval request"
                    meta="Waiting on client"
                    tone="blue"
                  />
                  <PreviewRow
                    icon={MessageSquareText}
                    label="Recent feedback"
                    meta="2 open notes"
                    tone="slate"
                  />
                  <PreviewRow
                    icon={CircleDollarSign}
                    label="Milestone payment"
                    meta="$2,400 due Jul 18"
                    tone="amber"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 hidden grid-cols-3 gap-2 sm:grid">
              <PreviewMetric label="Files shared" value="12 files" />
              <PreviewMetric label="Open feedback" value="2 notes" />
              <PreviewMetric label="Next delivery" value="Jul 18" />
            </div>
          </div>
        </div>
      </ProductWindow>

      <div className="marketing-float-card absolute -right-4 top-20 hidden w-48 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-950/10 xl:block">
        <div className="flex items-center justify-between">
          <BadgeCheck className="size-4 text-blue-700" />
          <StatusDot tone="amber" label="Waiting" />
        </div>
        <p className="mt-3 text-xs font-semibold">Homepage approval</p>
        <p className="mt-1 text-[0.68rem] leading-4 text-slate-500">
          One clear decision keeps delivery moving.
        </p>
      </div>

      <div className="marketing-float-card marketing-delay-3 absolute -bottom-5 -left-5 hidden w-52 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-950/10 xl:block">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold">Client viewed update</p>
            <p className="text-[0.68rem] text-slate-500">A few moments ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  meta,
  tone,
}: {
  icon: typeof BadgeCheck;
  label: string;
  meta: string;
  tone: "blue" | "slate" | "amber";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-700",
  } as const;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg ${toneClasses[tone]}`}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[0.7rem] font-semibold text-slate-800">
          {label}
        </p>
        <p className="truncate text-[0.65rem] text-slate-500">{meta}</p>
      </div>
    </div>
  );
}
