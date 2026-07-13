import {
  BadgeCheck,
  CircleDollarSign,
  FileText,
  FolderKanban,
  MessageSquareText,
} from "lucide-react";

import {
  MarketingContainer,
  ProductWindow,
  SectionHeading,
  StatusDot,
} from "@/features/marketing/marketing-shared";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";

const steps = [
  {
    icon: FolderKanban,
    number: "01",
    title: "Set up the work",
    description: "Create the client, project, milestones, and delivery plan.",
  },
  {
    icon: FileText,
    number: "02",
    title: "Share progress",
    description: "Publish updates and files in one client-ready view.",
  },
  {
    icon: BadgeCheck,
    number: "03",
    title: "Collect decisions",
    description: "Keep feedback and approvals attached to the work.",
  },
  {
    icon: CircleDollarSign,
    number: "04",
    title: "Close the loop",
    description: "Track delivery health, payment status, and next steps.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-20 sm:py-24 lg:py-28"
    >
      <MarketingContainer>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <MarketingReveal>
            <SectionHeading
              eyebrow="How DeliverFlow works"
              title="One visible flow from kickoff to completion."
              description="Each step stays connected, so your team knows what is moving and clients always know what comes next."
            />
          </MarketingReveal>
          <p className="max-w-xl text-sm leading-6 text-slate-500 lg:ml-auto lg:text-right">
            Built for service businesses that need strong client communication
            without introducing heavyweight project-management overhead.
          </p>
        </div>

        <ol className="relative mt-12 grid gap-0 border-y border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <span
            className="absolute left-0 top-0 hidden h-px w-1/4 bg-blue-600 lg:block"
            aria-hidden="true"
          />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className={`relative px-1 py-5 sm:px-5 lg:min-h-48 lg:py-6 ${index > 0 ? "sm:border-l sm:border-slate-200" : ""}`}
              >
                <MarketingReveal delay={index * 80}>
                  <div className="flex items-center justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-[-0.02em]">
                  {step.title}
                </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </MarketingReveal>
              </li>
            );
          })}
        </ol>

        <MarketingReveal className="mt-8" variant="scale-fade">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-2.5 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.46)] sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[0.66fr_1.34fr]">
            <div className="rounded-[1.25rem] bg-slate-950 p-5 text-white sm:p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-300">
                Shared delivery context
              </p>
              <h3 className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-[-0.04em]">
                Every update becomes a clear next action.
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                Files, comments, approval requests, and payments stay connected
                to the same project timeline.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <FlowSignal
                  icon={FileText}
                  title="Design preview shared"
                  meta="Today, 10:42"
                />
                <FlowSignal
                  icon={MessageSquareText}
                  title="Client feedback received"
                  meta="2 notes to review"
                />
                <FlowSignal
                  icon={BadgeCheck}
                  title="Approval requested"
                  meta="Decision pending"
                />
                <FlowSignal
                  icon={CircleDollarSign}
                  title="Payment scheduled"
                  meta="Due Jul 18"
                />
              </div>
            </div>

            <ProductWindow
              label="OWNER WORKSPACE"
              title="Website redesign · Delivery timeline"
              className="shadow-none"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Project activity</p>
                    <p className="mt-1 text-xs text-slate-500">
                      A single timeline across the full delivery cycle
                    </p>
                  </div>
                  <StatusDot tone="green" label="On track" />
                </div>
                <div className="relative mt-5 space-y-0 before:absolute before:bottom-4 before:left-[0.95rem] before:top-4 before:w-px before:bg-slate-200">
                  <TimelineItem
                    icon={FolderKanban}
                    title="Project created"
                    meta="Scope, five milestones, and client access added"
                    status="Complete"
                  />
                  <TimelineItem
                    icon={FileText}
                    title="Homepage design shared"
                    meta="Version 3 and project update published"
                    status="Complete"
                  />
                  <TimelineItem
                    icon={BadgeCheck}
                    title="Client review"
                    meta="Approval requested with two feedback notes open"
                    status="Current"
                    current
                  />
                  <TimelineItem
                    icon={CircleDollarSign}
                    title="Milestone payment"
                    meta="$2,400 scheduled after approval"
                    status="Next"
                  />
                </div>
              </div>
            </ProductWindow>
          </div>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </section>
  );
}

function FlowSignal({
  icon: Icon,
  title,
  meta,
}: {
  icon: typeof FileText;
  title: string;
  meta: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <Icon className="size-4 text-blue-300" />
      <p className="mt-2 text-xs font-semibold text-white">{title}</p>
      <p className="mt-1 text-[0.68rem] text-slate-400">{meta}</p>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  title,
  meta,
  status,
  current = false,
}: {
  icon: typeof FileText;
  title: string;
  meta: string;
  status: string;
  current?: boolean;
}) {
  return (
    <div className="relative flex gap-3 py-2.5">
      <span
        className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-lg ring-4 ring-white ${current ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-[0.68rem] leading-4 text-slate-500">{meta}</p>
        </div>
        <span
          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[0.62rem] font-semibold sm:mt-0 ${current ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
