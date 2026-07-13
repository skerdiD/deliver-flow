import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  FolderOpen,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";

import {
  MarketingContainer,
  PreviewMetric,
  ProductWindow,
  SectionHeading,
  StatusDot,
} from "@/features/marketing/marketing-shared";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";

export function ProductExperienceSection() {
  return (
    <section
      id="product"
      className="marketing-surface-muted scroll-mt-20 border-y border-blue-100/80 py-20 sm:py-24 lg:py-28"
    >
      <MarketingContainer>
        <MarketingReveal>
          <SectionHeading
            eyebrow="Core product experience"
            title="The right details, visible at the right moment."
            description="Project updates that usually sit in inboxes, folders, and spreadsheets stay together in one delivery view."
            align="center"
          />
        </MarketingReveal>

        <MarketingReveal className="mt-12" variant="scale-fade">
          <div className="marketing-card-group grid auto-rows-auto gap-4 lg:grid-cols-12">
            <article className="marketing-card marketing-panel-shadow relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 lg:col-span-7 lg:row-span-2 sm:p-7">
              <div className="max-w-lg">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-700">
                  Client portal
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  One clear place for every project.
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Clients can follow progress, review the current milestone,
                  find files, and respond without asking for another status
                  update.
                </p>
              </div>
              <ProductWindow
                label="CLIENT PORTAL"
                title="Northstar · Website redesign"
                className="-mx-1 mt-6 flex flex-1 flex-col shadow-[0_22px_55px_-35px_rgba(15,23,42,0.55)] sm:-mx-2"
              >
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">
                        Project overview
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Latest delivery status
                      </p>
                    </div>
                    <StatusDot tone="green" label="On track" />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <PreviewMetric label="Progress" value="82%" tone="blue" />
                    <PreviewMetric
                      label="Current milestone"
                      value="Design review"
                    />
                    <PreviewMetric label="Next delivery" value="Jul 18" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[82%] rounded-full bg-blue-600" />
                  </div>
                  <div className="mt-5 grid gap-3 lg:mt-auto">
                    <FeaturePreviewRow
                      icon={FileText}
                      title="Homepage design, version 3"
                      meta="Shared today"
                      status="Review"
                    />
                    <FeaturePreviewRow
                      icon={BadgeCheck}
                      title="Homepage approval"
                      meta="Waiting for the client"
                      status="Pending"
                      accent
                    />
                  </div>
                </div>
              </ProductWindow>
            </article>

            <article className="marketing-card marketing-panel-shadow rounded-[1.75rem] border border-blue-200 bg-blue-50/80 p-5 lg:col-span-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-700">
                    Feedback & approvals
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                    Decisions stay attached to the work.
                  </h3>
                </div>
                <span className="marketing-card-icon grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/15">
                  <BadgeCheck className="size-5" />
                </span>
              </div>
              <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    Homepage design approval
                  </p>
                  <StatusDot tone="amber" label="Pending" />
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  “The new direction is ready. Please approve or leave a clear
                  change request.”
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <span className="rounded-lg bg-slate-950 px-2 py-2 text-xs font-semibold text-white">
                    Approve
                  </span>
                  <span className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700">
                    Request changes
                  </span>
                </div>
              </div>
            </article>

            <article className="marketing-card marketing-panel-shadow rounded-[1.75rem] border border-slate-200 bg-white p-5 lg:col-span-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-700">
                    Files, milestones & updates
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                    Files and updates stay with the project.
                  </h3>
                </div>
                <span className="marketing-card-icon grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <FolderOpen className="size-5" />
                </span>
              </div>
              <div className="mt-6 space-y-2">
                <FileRow
                  icon={FileText}
                  name="homepage-v3.pdf"
                  meta="Final design · 12.4 MB"
                  status="Shared"
                />
                <FileRow
                  icon={MessageSquareText}
                  name="Project update"
                  meta="Homepage direction is ready"
                  status="Viewed"
                />
                <FileRow
                  icon={CalendarDays}
                  name="Design review"
                  meta="Milestone 4 of 5"
                  status="Current"
                />
              </div>
            </article>

            <article className="marketing-card overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950 p-5 text-white lg:col-span-12 sm:p-7">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-300">
                    Owner workspace
                  </p>
                  <h3 className="mt-2 max-w-lg text-2xl font-semibold tracking-[-0.04em]">
                    See delivery health before small issues become delays.
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                    The owner dashboard puts open feedback, waiting approvals,
                    project progress, and payment status in one place.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-blue-300" />
                      Needs-attention queue
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 className="size-3.5 text-blue-300" />
                      Delivery analytics
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CircleDollarSign className="size-3.5 text-blue-300" />
                      Payment visibility
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 sm:p-4">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <DarkMetric
                      icon={TrendingUp}
                      label="Active projects"
                      value="8"
                      meta="6 on track"
                    />
                    <DarkMetric
                      icon={MessageSquareText}
                      label="Open feedback"
                      value="3"
                      meta="2 new today"
                    />
                    <DarkMetric
                      icon={CircleDollarSign}
                      label="Payments due"
                      value="$4.8k"
                      meta="Across 2 projects"
                    />
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <AttentionRow
                      icon={Clock3}
                      tone="amber"
                      label="Client approval waiting"
                      project="Website redesign"
                    />
                    <AttentionRow
                      icon={CircleDollarSign}
                      tone="red"
                      label="Payment overdue"
                      project="Brand launch"
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </section>
  );
}

function FeaturePreviewRow({
  icon: Icon,
  title,
  meta,
  status,
  accent = false,
}: {
  icon: typeof FileText;
  title: string;
  meta: string;
  status: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${
        accent
          ? "border-amber-200 bg-amber-50/70"
          : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-lg ${
          accent ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-600">{meta}</p>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          accent
            ? "bg-amber-100 text-amber-800"
            : "bg-white text-blue-700 ring-1 ring-slate-200"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function FileRow({
  icon: Icon,
  name,
  meta,
  status,
}: {
  icon: typeof FileText;
  name: string;
  meta: string;
  status: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-slate-600">{meta}</p>
      </div>
      <span className="text-xs font-semibold text-blue-700">{status}</span>
    </div>
  );
}

function DarkMetric({
  icon: Icon,
  label,
  value,
  meta,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-3.5">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-medium">{label}</span>
        <Icon className="size-3.5 text-blue-300" />
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{meta}</p>
    </div>
  );
}

function AttentionRow({
  icon: Icon,
  tone,
  label,
  project,
}: {
  icon: typeof Clock3;
  tone: "amber" | "red";
  label: string;
  project: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900 p-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone === "amber" ? "bg-amber-400/10 text-amber-300" : "bg-red-400/10 text-red-300"}`}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="truncate text-xs text-slate-300">{project}</p>
      </div>
    </div>
  );
}
